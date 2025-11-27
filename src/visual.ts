"use strict";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";
import { PasswordModalDialog, PasswordModalDialogResult } from "./PasswordModalDialog";
import * as CryptoJS from "crypto-js";

import "./../style/visual.less";

// Import types
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import DataView = powerbi.DataView;
import DialogAction = powerbi.DialogAction;
import VisualDialogPositionType = powerbi.VisualDialogPositionType;

/**
 * Organization Password Filter Visual
 * 
 * PURPOSE: Provides password-based access control for public PowerBI dashboards
 * where users don't have PowerBI accounts.
 * 
 * SECURITY MODEL (v2.1.0+): Uses AES-256 encryption
 * - Organization names are encrypted with their passwords
 * - No plaintext passwords or org names in the code
 * - Password acts as decryption key - only correct password can decrypt the org
 * - Much more secure than plaintext JSON mapping
 * 
 * IMPORTANT: Still client-side security (not military-grade)
 * - Suitable for public dashboards with basic protection
 * - Significantly raises the bar vs plaintext
 * - For enterprise security, use PowerBI Row-Level Security (RLS)
 */
export class OrganizationPasswordFilter implements powerbi.extensibility.visual.IVisual {
    private host: IVisualHost;
    private container: HTMLElement;
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    
    // UI Elements
    private titleLabel: HTMLDivElement;
    private passwordSection: HTMLElement;
    private passwordInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private messageDiv: HTMLDivElement;
    private modalStatusDiv: HTMLDivElement | null = null;
    
    // State
    private currentOrganization: string | null = null;
    private currentDataView: DataView | null = null;
    private encryptedMappings: string[] = [];

    constructor(options?: VisualConstructorOptions) {
        if (!options) {
            throw new Error("VisualConstructorOptions is required");
        }
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();
        
        // Create main container
        this.container = document.createElement("div");
        this.container.className = "passwordFilterContainer";
        
        // Create title
        this.titleLabel = document.createElement("div");
        this.titleLabel.className = "titleLabel";
        this.titleLabel.textContent = "Organization Login";
        
        // Create password section (inline form)
        this.passwordSection = document.createElement("div");
        this.passwordSection.className = "passwordSection";
        
        this.passwordInput = document.createElement("input");
        this.passwordInput.type = "password";
        this.passwordInput.className = "passwordInput";
        this.passwordInput.placeholder = "Enter password";
        
        this.submitButton = document.createElement("button");
        this.submitButton.textContent = "Enter";
        this.submitButton.className = "submitButton";
        
        this.messageDiv = document.createElement("div");
        this.messageDiv.className = "messageDiv";
        
        this.passwordSection.appendChild(this.passwordInput);
        this.passwordSection.appendChild(this.submitButton);
        this.passwordSection.appendChild(this.messageDiv);
        
        this.container.appendChild(this.titleLabel);
        this.container.appendChild(this.passwordSection);
        options.element.appendChild(this.container);
        
        // Event listeners
        this.submitButton.addEventListener("click", () => this.handlePasswordSubmit());
        this.passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.handlePasswordSubmit();
        });
    }

    public update(options: VisualUpdateOptions) {
        // Load settings
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel, 
            options.dataViews
        );
        
        // Update title
        const title = this.formattingSettings?.general?.title?.value || "Organization Login";
        this.titleLabel.textContent = title;
        
        // Load encrypted mappings from settings
        this.loadEncryptedMappings();
        
        // Store dataView
        const dataView = options.dataViews?.[0];
        if (!dataView || !dataView.table) {
            this.blockAllData();
            return;
        }
        this.currentDataView = dataView;
        
        // Check display mode
        const useModalMode = this.formattingSettings?.general?.useModalMode?.value === true;
        
        if (useModalMode) {
            this.renderModalMode();
        } else {
            this.renderInlineMode();
        }
        
        // Apply filtering based on current state
        if (!this.currentOrganization) {
            // No password entered - block all data
            this.blockAllData();
        } else if (this.currentOrganization === "ADMIN") {
            // Admin access - show all data
            this.clearFilter();
        } else {
            // Normal user - filter to their organization
            this.applyFilter(this.currentOrganization);
        }
    }

    /**
     * Load encrypted mappings from settings
     * Parses the JSON array of encrypted organization names
     */
    private loadEncryptedMappings(): void {
        const encryptedJSON = this.formattingSettings?.security?.encryptedMappings?.value?.trim();
        
        if (!encryptedJSON) {
            // No mappings configured - use empty array
            this.encryptedMappings = [];
            return;
        }
        
        try {
            const parsed = JSON.parse(encryptedJSON);
            if (Array.isArray(parsed)) {
                this.encryptedMappings = parsed;
            } else {
                this.showMessage("Invalid encrypted mappings format", "error");
                this.encryptedMappings = [];
            }
        } catch (error) {
            this.showMessage("Error parsing encrypted mappings", "error");
            this.encryptedMappings = [];
        }
    }

    /**
     * Find organization by attempting to decrypt encrypted mappings with the password
     * Uses AES-256 encryption - password acts as the decryption key
     * Returns organization name if decryption succeeds, null otherwise
     */
    private findOrganizationByPassword(password: string): string | null {
        if (this.encryptedMappings.length === 0) {
            this.showMessage("No password mappings configured", "error");
            return null;
        }
        for (const encryptedOrg of this.encryptedMappings) {
            try {
                // Try to decrypt the encrypted organization name with the password
                const decrypted = CryptoJS.AES.decrypt(encryptedOrg, password).toString(CryptoJS.enc.Utf8);
                
                // Validate it's a real organization name (not garbage from wrong password)
                // Valid org names: letters, spaces, hyphens (e.g., "UN-HABITAT", "UN Secretariat")
                if (decrypted && decrypted.length > 0 && /^[A-Z\s\-]+$/i.test(decrypted)) {
                    return decrypted; // Successfully decrypted! This is the organization
                }
            } catch {
                // Decryption failed or invalid, try next mapping
                continue;
            }
        }
        
        return null; // No matching organization found
    }

    /**
     * Handle password submission
     */
    private handlePasswordSubmit(): void {
        const password = this.passwordInput.value.trim();
        
        if (!password) {
            this.showMessage("Please enter a password", "error");
            this.currentOrganization = null;
            this.blockAllData();
            return;
        }
        
        // Check admin password first
        const adminPassword = this.formattingSettings?.security?.adminPassword?.value?.trim();
        if (adminPassword && password === adminPassword) {
            this.currentOrganization = "ADMIN";
            this.showMessage("Admin access granted - viewing all organizations", "success");
            this.clearFilter();
            this.updateModalStatus();
            return;
        }
        
        // Try to decrypt and find organization with the password
        const organization = this.findOrganizationByPassword(password);
        if (organization) {
            this.currentOrganization = organization;
            this.showMessage(`Access granted - viewing ${organization}`, "success");
            this.applyFilter(organization);
            this.updateModalStatus();
        } else {
            this.showMessage("Invalid password", "error");
            this.currentOrganization = null;
            this.blockAllData();
        }
    }

    /**
     * Block all data access (apply empty filter)
     */
    private blockAllData(): void {
        try {
            if (!this.currentDataView?.table) return;
            
            const table = this.currentDataView.table;
            const orgColumn = this.findOrganizationColumn(table);
            
            if (!orgColumn) return;
            
            const filterJson = {
                $schema: "https://powerbi.com/product/schema#basic",
                target: {
                    table: orgColumn.table,
                    column: orgColumn.column
                },
                operator: "In",
                values: [] // Empty array = no data matches
            };
            
            this.host.applyJsonFilter(filterJson, "general", "filter", powerbi.FilterAction.merge);
        } catch (error) {
            // Silently fail
        }
    }

    /**
     * Apply filter to show only specified organization
     */
    private applyFilter(organization: string): void {
        try {
            if (!this.currentDataView?.table) return;
            
            const table = this.currentDataView.table;
            const orgColumn = this.findOrganizationColumn(table);
            
            if (!orgColumn) {
                this.showMessage("Organization column not found", "error");
                return;
            }
            
            const filterJson = {
                $schema: "https://powerbi.com/product/schema#basic",
                target: {
                    table: orgColumn.table,
                    column: orgColumn.column
                },
                operator: "In",
                values: [organization]
            };
            
            this.host.applyJsonFilter(filterJson, "general", "filter", powerbi.FilterAction.merge);
        } catch (error) {
            this.showMessage("Error applying filter", "error");
        }
    }

    /**
     * Clear filter to show all organizations (admin mode)
     */
    private clearFilter(): void {
        try {
            if (!this.currentDataView?.table) return;
            
            const table = this.currentDataView.table;
            const orgColumn = this.findOrganizationColumn(table);
            
            if (!orgColumn) return;
            
            // Get all unique organizations
            const allOrgs = this.getAllOrganizations(table);
            
            if (allOrgs.length > 0) {
                const filterJson = {
                    $schema: "https://powerbi.com/product/schema#basic",
                    target: {
                        table: orgColumn.table,
                        column: orgColumn.column
                    },
                    operator: "In",
                    values: allOrgs
                };
                
                this.host.applyJsonFilter(filterJson, "general", "filter", powerbi.FilterAction.merge);
            }
        } catch (error) {
            // Silently fail
        }
    }

    /**
     * Find organization column in table
     */
    private findOrganizationColumn(table: any): { table: string; column: string } | null {
        const orgColIndex = table.columns.findIndex((col: any) => {
            const name = (col.displayName || col.queryName || "").toLowerCase();
            return name.includes("organization") || name.includes("org");
        });
        
        if (orgColIndex < 0) return null;
        
        const orgColumn = table.columns[orgColIndex];
        const queryName = orgColumn.queryName || orgColumn.displayName;
        const tableName = queryName.split('.')[0] || queryName;
        const columnName = queryName.split('.').pop() || orgColumn.displayName;
        
        return { table: tableName, column: columnName };
    }

    /**
     * Get all unique organizations from table
     */
    private getAllOrganizations(table: any): string[] {
        const orgColIndex = table.columns.findIndex((col: any) => {
            const name = (col.displayName || col.queryName || "").toLowerCase();
            return name.includes("organization") || name.includes("org");
        });
        
        if (orgColIndex < 0) return [];
        
        const orgs = new Set<string>();
        table.rows?.forEach((row: any) => {
            const orgValue = String(row[orgColIndex] || "").trim();
            if (orgValue) orgs.add(orgValue);
        });
        
        return Array.from(orgs);
    }

    /**
     * Show message to user
     */
    private showMessage(message: string, type: "success" | "error"): void {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `messageDiv ${type}`;
        
        if (type === "success") {
            setTimeout(() => {
                this.messageDiv.textContent = "";
                this.messageDiv.className = "messageDiv";
            }, 3000);
        }
    }

    /**
     * Render inline mode (form always visible)
     */
    private renderInlineMode(): void {
        this.titleLabel.style.display = "block";
        this.passwordSection.style.display = "flex";
        
        if (this.modalStatusDiv && this.modalStatusDiv.parentNode) {
            this.modalStatusDiv.parentNode.removeChild(this.modalStatusDiv);
            this.modalStatusDiv = null;
        }
    }

    /**
     * Render modal mode (button to open form in popup)
     */
    private renderModalMode(): void {
        this.titleLabel.style.display = "none";
        this.passwordSection.style.display = "none";
        
        // Remove existing status div
        if (this.modalStatusDiv && this.modalStatusDiv.parentNode) {
            this.modalStatusDiv.parentNode.removeChild(this.modalStatusDiv);
        }
        
        // Create status div
        this.modalStatusDiv = document.createElement("div");
        this.modalStatusDiv.className = this.currentOrganization ? "loggedInStatus" : "loginRequiredStatus";
        
        if (this.currentOrganization) {
            // Logged in - show status
            const orgDisplay = this.currentOrganization === "ADMIN" ? "Admin (All Organizations)" : this.currentOrganization;
            
            const statusText = document.createElement("div");
            statusText.style.cssText = "color: #2e7d32; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;";
            const checkmark = document.createElement("span");
            checkmark.textContent = "✓";
            checkmark.style.cssText = "color: #2e7d32; font-size: 14px; font-weight: bold;";
            statusText.appendChild(checkmark);
            statusText.appendChild(document.createTextNode(` Logged in as: ${orgDisplay}`));
            
            const changeButton = document.createElement("button");
            changeButton.textContent = "Change Password";
            changeButton.className = "changePasswordButton";
            changeButton.onclick = () => this.openPasswordModal();
            
            this.modalStatusDiv.appendChild(statusText);
            this.modalStatusDiv.appendChild(changeButton);
        } else {
            // Not logged in - show login button
            const statusText = document.createElement("div");
            statusText.style.cssText = "color: #ff6f00; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; justify-content: center;";
            const crossIcon = document.createElement("span");
            crossIcon.textContent = "✗";
            crossIcon.style.cssText = "color: #ff6f00; font-size: 14px; font-weight: bold;";
            statusText.appendChild(crossIcon);
            statusText.appendChild(document.createTextNode(" Login Required"));
            
            const loginButton = document.createElement("button");
            loginButton.textContent = "Enter Password";
            loginButton.className = "modalLoginButton";
            loginButton.type = "button"; // Ensure it's a button, not submit
            loginButton.style.cssText = `
                padding: 6px 12px;
                background-color: #ff6f00;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: normal;
                width: 100%;
                box-sizing: border-box;
                transition: background-color 0.3s;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
            `;
            loginButton.onmouseover = () => {
                loginButton.style.backgroundColor = "#e65100";
            };
            loginButton.onmouseout = () => {
                loginButton.style.backgroundColor = "#ff6f00";
            };
            loginButton.onclick = () => this.openPasswordModal();
            
            this.modalStatusDiv.appendChild(statusText);
            this.modalStatusDiv.appendChild(loginButton);
        }
        
        this.container.appendChild(this.modalStatusDiv);
    }

    /**
     * Update modal status (after password change)
     */
    private updateModalStatus(): void {
        const useModalMode = this.formattingSettings?.general?.useModalMode?.value === true;
        if (useModalMode) {
            this.renderModalMode();
        }
    }

    /**
     * Open password modal dialog
     */
    private openPasswordModal(): void {
        try {
            if (!this.host.hostCapabilities?.allowModalDialog) {
                this.renderInlineMode();
                return;
            }

            const dialogOptions: any = {
                title: "",
                size: { width: 400, height: 250 },
                position: { type: VisualDialogPositionType.Center },
                actionButtons: [DialogAction.OK, DialogAction.Cancel]
            };

            const initialState = {
                placeholder: "Enter password",
                buttonText: "Enter"
            };

            this.host.openModalDialog(PasswordModalDialog.id, dialogOptions, initialState)
                .then((result) => this.handleModalResult(result))
                .catch(() => this.showMessage("Error opening dialog", "error"));
        } catch (error) {
            this.showMessage("Error opening dialog", "error");
        }
    }

    /**
     * Handle modal dialog result
     */
    private handleModalResult(result: any): void {
        if (result.actionId === DialogAction.OK && result.resultState) {
            const dialogResult = result.resultState as PasswordModalDialogResult;
            const password = dialogResult.password?.trim();

            if (password) {
                this.passwordInput.value = password;
                this.handlePasswordSubmit();
            }
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
