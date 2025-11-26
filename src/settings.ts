"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * General Settings Card - Visual appearance and behavior
 */
class GeneralSettingsCard extends FormattingSettingsCard {
    public title = new formattingSettings.TextInput({
        name: "title",
        displayName: "Title",
        value: "Organization Login",
        placeholder: "Enter title"
    });

    public useModalMode = new formattingSettings.ToggleSwitch({
        name: "useModalMode",
        displayName: "Use Modal Mode",
        value: false,
        description: "Show login form in a popup dialog (saves space)"
    });

    public name: string = "general";
    public displayName: string = "General Settings";
    public slices: Array<FormattingSettingsSlice> = [this.title, this.useModalMode];
}

/**
 * Security Settings Card - AES-256 Encrypted Password Configuration
 * 
 * SECURITY NOTE (v2.1.0+): 
 * - Organization passwords are encrypted with AES-256 
 * - Paste encrypted JSON from the encryption script
 * - No plaintext passwords visible in settings
 * - Much more secure than plaintext mappings
 * 
 * To update organization passwords:
 * 1. Edit OrgPass.csv
 * 2. Run: node tools/encrypt-passwords.js
 * 3. Copy the encrypted JSON output
 * 4. Paste into "Encrypted Mappings" field below
 * 5. Refresh visual - NO REBUILD NEEDED!
 */
class SecuritySettingsCard extends FormattingSettingsCard {
    public encryptedMappings = new formattingSettings.TextInput({
        name: "encryptedMappings",
        displayName: "Encrypted Mappings (JSON)",
        value: "",
        placeholder: '[{"e":"U2Fsd..."}]',
        description: "Paste encrypted JSON from encryption script. Run: node tools/encrypt-passwords.js"
    });

    public adminPassword = new formattingSettings.TextInput({
        name: "adminPassword",
        displayName: "Admin Password",
        value: "",
        placeholder: "Enter admin password",
        description: "Admin password to view all organizations without filtering"
    });

    public name: string = "security";
    public displayName: string = "Security Settings";
    public slices: Array<FormattingSettingsSlice> = [this.encryptedMappings, this.adminPassword];
}

/**
 * Visual formatting settings model
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    public general: GeneralSettingsCard = new GeneralSettingsCard();
    public security: SecuritySettingsCard = new SecuritySettingsCard();
    public cards = [this.general, this.security];
}

