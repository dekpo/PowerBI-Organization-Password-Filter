"use strict";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

import "./../style/visual.less";

// Import types from powerbi-visuals-api
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import FilterAction = powerbi.FilterAction;

export class OrganizationPasswordFilter implements powerbi.extensibility.visual.IVisual {
    private host: IVisualHost;
    private element: HTMLElement;
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private passwordInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private messageDiv: HTMLDivElement;
    private dataTable: HTMLTableElement;
    private currentOrganization: string | null = null;
    private allData: any[] = [];
    private organizationColumn: string = "Organization";
    private organizationTableName: string = "";
    private organizationColumnQueryName: string = "";

    constructor(options?: VisualConstructorOptions) {
        if (!options) {
            throw new Error("VisualConstructorOptions is required");
        }
        this.host = options.host;
        this.element = options.element;
        this.formattingSettingsService = new FormattingSettingsService();
        
        // Create container
        const container = document.createElement("div");
        container.className = "passwordFilterContainer";
        
        // Create password input section
        const passwordSection = document.createElement("div");
        passwordSection.className = "passwordSection";
        
        const passwordLabel = document.createElement("label");
        passwordLabel.textContent = "Enter Password:";
        passwordLabel.className = "passwordLabel";
        
        this.passwordInput = document.createElement("input");
        this.passwordInput.type = "password";
        this.passwordInput.className = "passwordInput";
        this.passwordInput.placeholder = "Enter password to filter by organization";
        
        this.submitButton = document.createElement("button");
        this.submitButton.textContent = "Filter";
        this.submitButton.className = "submitButton";
        
        this.messageDiv = document.createElement("div");
        this.messageDiv.className = "messageDiv";
        
        passwordSection.appendChild(passwordLabel);
        passwordSection.appendChild(this.passwordInput);
        passwordSection.appendChild(this.submitButton);
        passwordSection.appendChild(this.messageDiv);
        
        // Create data table section
        const tableSection = document.createElement("div");
        tableSection.className = "tableSection";
        
        this.dataTable = document.createElement("table");
        this.dataTable.className = "dataTable";
        
        tableSection.appendChild(this.dataTable);
        
        container.appendChild(passwordSection);
        container.appendChild(tableSection);
        
        this.element.appendChild(container);
        
        // Add event listeners
        this.submitButton.addEventListener("click", () => this.handlePasswordSubmit());
        this.passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handlePasswordSubmit();
            }
        });
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        
        const dataView: DataView = options.dataViews[0];
        if (!dataView || !dataView.table) {
            this.showMessage("No data available", "error");
            return;
        }

        // Extract data from dataView
        const table = dataView.table;
        const rows = table.rows;
        
        if (!rows || rows.length === 0) {
            this.showMessage("No data rows available", "error");
            return;
        }

        // Get column names
        const columns = table.columns.map((col: any) => col.displayName || col.queryName);
        
        // Store all data
        this.allData = rows.map((row: any) => {
            const rowData: any = {};
            columns.forEach((col: string, index: number) => {
                rowData[col] = row[index];
            });
            return rowData;
        });

        // Find organization column and store metadata
        const orgColIndex = table.columns.findIndex((col: any) => {
            const colName = (col.displayName || col.queryName || "").toLowerCase();
            return colName.includes("organization") || colName.includes("org");
        });
        
        if (orgColIndex >= 0) {
            const orgCol = table.columns[orgColIndex];
            this.organizationColumn = orgCol.displayName || orgCol.queryName || "Organization";
            
            // Get the queryName - this is the most reliable identifier
            let queryName = orgCol.queryName || "";
            
            // Try to get from DataViewMetadata first (most reliable)
            if (dataView.metadata && dataView.metadata.columns) {
                const metadataCol = dataView.metadata.columns.find((c: any) => {
                    const cQueryName = c.queryName || "";
                    const cDisplayName = c.displayName || "";
                    return cQueryName === queryName || 
                           cDisplayName === this.organizationColumn ||
                           cQueryName.toLowerCase().includes("organization") ||
                           cDisplayName.toLowerCase().includes("organization");
                });
                
                if (metadataCol && metadataCol.queryName) {
                    queryName = metadataCol.queryName;
                }
            }
            
            // Extract table name and column name from queryName
            // Format can be: "TableName.ColumnName" or just "ColumnName"
            if (queryName && queryName.includes(".")) {
                const parts = queryName.split(".");
                this.organizationTableName = parts[0];
                this.organizationColumnQueryName = queryName; // Full qualified name
            } else {
                // No dot found - try to get table name from other columns or metadata
                // Check if any column has a table name
                const firstColWithTable = table.columns.find((col: any) => 
                    col.queryName && col.queryName.includes(".")
                );
                
                if (firstColWithTable && firstColWithTable.queryName) {
                    const tableName = firstColWithTable.queryName.split(".")[0];
                    this.organizationTableName = tableName;
                    this.organizationColumnQueryName = `${tableName}.${queryName || this.organizationColumn}`;
                } else {
                    // Last resort: use queryName as both table and column
                    // Power BI might accept this format
                    this.organizationTableName = queryName || this.organizationColumn;
                    this.organizationColumnQueryName = queryName || this.organizationColumn;
                }
            }
        }

        // Apply current filter if exists
        if (this.currentOrganization) {
            this.filterAndDisplayData(this.currentOrganization);
        } else {
            this.displayData(this.allData, columns);
        }
    }

    private handlePasswordSubmit() {
        const password = this.passwordInput.value.trim();
        
        if (!password) {
            this.showMessage("Please enter a password", "error");
            this.currentOrganization = null;
            this.displayData(this.allData, Object.keys(this.allData[0] || {}));
            // Clear global filter when password is empty
            this.clearFilter();
            return;
        }

        // Get organization mapping from settings or use default
        const mappingJson = this.formattingSettings?.filterSettings?.organizationMapping?.value || 
            this.getDefaultPasswordMapping();
        
        let passwordMapping: { [key: string]: string };
        try {
            passwordMapping = typeof mappingJson === "string" ? JSON.parse(mappingJson) : mappingJson;
        } catch (e) {
            passwordMapping = this.getDefaultPasswordMapping();
        }

        // Check password and get organization
        const organization = passwordMapping[password];
        
        if (!organization) {
            this.showMessage("Invalid password", "error");
            this.currentOrganization = null;
            this.displayData(this.allData, Object.keys(this.allData[0] || {}));
            // Clear global filter
            this.clearFilter();
            return;
        }

        // Apply filter
        this.currentOrganization = organization;
        this.showMessage(`Filtered by: ${organization}`, "success");
        this.filterAndDisplayData(organization);
        
        // Apply filter to Power BI globally
        this.applyFilter(organization);
    }

    private getDefaultPasswordMapping(): { [key: string]: string } {
        return {
            "FAO123": "FAO",
            "UNICEF123": "UNICEF",
            "UNHCR123": "UNHCR",
            "WHO123": "WHO",
            "WIPO123": "WIPO"
        };
    }

    private filterAndDisplayData(organization: string) {
        const filteredData = this.allData.filter(row => 
            String(row[this.organizationColumn]).toUpperCase() === organization.toUpperCase()
        );
        
        const columns = Object.keys(this.allData[0] || {});
        this.displayData(filteredData, columns);
    }

    private displayData(data: any[], columns: string[]) {
        // Clear existing table
        while (this.dataTable.firstChild) {
            this.dataTable.removeChild(this.dataTable.firstChild);
        }
        
        if (data.length === 0) {
            const noDataRow = this.dataTable.insertRow();
            const noDataCell = noDataRow.insertCell();
            noDataCell.colSpan = columns.length;
            noDataCell.textContent = "No data to display";
            noDataCell.className = "noDataCell";
            return;
        }

        // Create header row
        const headerRow = this.dataTable.createTHead().insertRow();
        columns.forEach((col: string) => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });

        // Create body
        const tbody = this.dataTable.createTBody();
        data.forEach((row: any) => {
            const tr = tbody.insertRow();
            columns.forEach((col: string) => {
                const td = tr.insertCell();
                const value = row[col];
                td.textContent = value !== null && value !== undefined ? String(value) : "";
            });
        });
    }

    private applyFilter(organization: string) {
        try {
            if (!this.organizationTableName || !this.organizationColumnQueryName) {
                this.showMessage("Cannot apply filter - metadata not available", "error");
                return;
            }

            // Create a basic filter using Power BI's filter interface
            // This filter will affect all visuals in the dashboard that use the same data source
            const filter: any = {
                $schema: "https://powerbi.com/product/schema#basic",
                target: {
                    table: this.organizationTableName,
                    column: this.organizationColumnQueryName
                },
                operator: "In",
                values: [organization],
                filterType: 1 // BasicFilter type
            };

            // Use the correct Power BI API method to apply the filter
            // This applies a cross-filter that affects all visuals using the same field
            // applyJsonFilter(filter, objectName, propertyName, action)
            this.host.applyJsonFilter(filter, "general", "filter", FilterAction.merge);
            
        } catch (error: any) {
            const errorMsg = error?.message || String(error);
            this.showMessage(`Filter error: ${errorMsg}`, "error");
        }
    }

    private clearFilter() {
        try {
            if (!this.organizationTableName || !this.organizationColumnQueryName) {
                return;
            }

            // Clear the filter by applying an empty filter (no values)
            // This makes other visuals show no data when there's no valid password
            const emptyFilter: any = {
                $schema: "https://powerbi.com/product/schema#basic",
                target: {
                    table: this.organizationTableName,
                    column: this.organizationColumnQueryName
                },
                operator: "In",
                values: [], // Empty values = no matches = no data shown
                filterType: 1 // BasicFilter type
            };

            // Apply empty filter to clear the selection
            // applyJsonFilter(filter, objectName, propertyName, action)
            this.host.applyJsonFilter(emptyFilter, "general", "filter", FilterAction.merge);
            
        } catch (error: any) {
            // Silently handle clear filter errors
        }
    }

    private showMessage(message: string, type: "success" | "error") {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `messageDiv ${type}`;
        
        if (type === "success") {
            setTimeout(() => {
                this.messageDiv.textContent = "";
                this.messageDiv.className = "messageDiv";
            }, 3000);
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public enumerateObjectInstances(
        _options: EnumerateVisualObjectInstancesOptions
    ): VisualObjectInstanceEnumeration {
        // FormattingSettingsService doesn't have enumerateObjectInstances in this version
        // Return empty enumeration - formatting is handled via getFormattingModel
        return [];
    }
}

