"use strict";

import powerbi from "powerbi-visuals-api";
import DialogConstructorOptions = powerbi.extensibility.visual.DialogConstructorOptions;
import DialogAction = powerbi.DialogAction;

/**
 * Result class for Password Modal Dialog
 */
export class PasswordModalDialogResult {
    password: string = "";
    organization?: string;
}

/**
 * Password Modal Dialog Class
 * This dialog displays a password input form in a modal window
 */
export class PasswordModalDialog {
    static id = "PasswordModalDialog";

    constructor(options: DialogConstructorOptions, initialState: any) {
        const host = options.host;
        const element = options.element;
        
        // Get initial state (title is shown by Power BI in modal header, so we don't need it here)
        const placeholder = initialState?.placeholder || "Enter password";
        const buttonText = initialState?.buttonText || "Enter";
        
        // Create dialog content container - centered layout
        const container = document.createElement("div");
        container.className = "passwordModalDialog";
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            align-items: center;
            justify-content: center;
        `;

        // Note: Title is already shown by Power BI in the modal header, so we don't add it here

        // Create inner content wrapper for centering
        const contentWrapper = document.createElement("div");
        contentWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
            max-width: 300px;
            align-items: center;
        `;

        // Create password input
        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.className = "passwordModalInput";
        passwordInput.placeholder = placeholder;
        passwordInput.style.cssText = `
            padding: 12px;
            border: 1px solid #8a8886;
            border-radius: 4px;
            font-size: 14px;
            width: 100%;
            box-sizing: border-box;
        `;
        contentWrapper.appendChild(passwordInput);

        // Create message div
        const messageDiv = document.createElement("div");
        messageDiv.className = "passwordModalMessage";
        messageDiv.style.cssText = `
            font-size: 12px;
            min-height: 20px;
            color: #d13438;
            visibility: hidden;
            width: 100%;
            text-align: center;
        `;
        contentWrapper.appendChild(messageDiv);

        // Create button container - centered
        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            width: 100%;
        `;

        // Create submit button
        const submitButton = document.createElement("button");
        submitButton.textContent = buttonText;
        submitButton.className = "passwordModalSubmit";
        submitButton.style.cssText = `
            padding: 8px 16px;
            background-color: #0078d4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        submitButton.onmouseover = () => {
            submitButton.style.backgroundColor = "#106ebe";
        };
        submitButton.onmouseout = () => {
            submitButton.style.backgroundColor = "#0078d4";
        };

        // Create cancel button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = "passwordModalCancel";
        cancelButton.style.cssText = `
            padding: 8px 16px;
            background-color: transparent;
            color: #323130;
            border: 1px solid #8a8886;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        cancelButton.onmouseover = () => {
            cancelButton.style.backgroundColor = "#f3f2f1";
        };
        cancelButton.onmouseout = () => {
            cancelButton.style.backgroundColor = "transparent";
        };

        // Helper function to show message
        const showMessage = (text: string, type: "error" | "success" = "error") => {
            messageDiv.textContent = text;
            messageDiv.style.visibility = "visible";
            messageDiv.style.color = type === "error" ? "#d13438" : "#107c10";
        };

        // Helper function to hide message
        const hideMessage = () => {
            messageDiv.style.visibility = "hidden";
            messageDiv.textContent = "";
        };

        // Handle password submission
        const handleSubmit = () => {
            const password = passwordInput.value.trim();
            
            if (!password) {
                showMessage("Please enter a password", "error");
                return;
            }

            hideMessage();
            
            // Return password to visual
            const result: PasswordModalDialogResult = {
                password: password
            };
            
            host.setResult(result);
            host.close(DialogAction.OK, result);
        };

        // Handle cancel
        const handleCancel = () => {
            host.close(DialogAction.Cancel);
        };

        // Add event listeners
        submitButton.addEventListener("click", handleSubmit);
        cancelButton.addEventListener("click", handleCancel);
        
        // Enter key to submit
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleSubmit();
            }
        });

        // Focus password input when dialog opens
        setTimeout(() => {
            passwordInput.focus();
        }, 100);

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(submitButton);
        contentWrapper.appendChild(buttonContainer);

        // Append wrapper to container
        container.appendChild(contentWrapper);

        // Append to dialog element
        element.appendChild(container);
    }
}

// Register dialog in global registry
declare global {
    interface Window {
        dialogRegistry?: { [key: string]: any };
    }
}

const globalRegistry = (globalThis as any).dialogRegistry || {};
(globalThis as any).dialogRegistry = globalRegistry;
globalRegistry[PasswordModalDialog.id] = PasswordModalDialog;

