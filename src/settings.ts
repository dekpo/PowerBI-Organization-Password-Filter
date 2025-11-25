"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * General Settings Card
 */
class GeneralSettingsCard extends FormattingSettingsCard {
    public title = new formattingSettings.TextInput({
        name: "title",
        displayName: "Title",
        value: "Login",
        placeholder: "Enter component title"
    });

    public useModalMode = new formattingSettings.ToggleSwitch({
        name: "useModalMode",
        displayName: "Use Modal Dialog Mode",
        value: false, // Default to inline mode
        description: "When enabled, password form appears in a modal popup. When disabled, form is shown inline."
    });

    public name: string = "general";
    public displayName: string = "General";
    public slices: Array<FormattingSettingsSlice> = [this.title, this.useModalMode];
}

/**
 * Password Settings Card
 */
class PasswordSettingsCard extends FormattingSettingsCard {
    public password = new formattingSettings.TextInput({
        name: "password",
        displayName: "Password",
        value: "",
        placeholder: ""
    });

    public showPassword = new formattingSettings.ToggleSwitch({
        name: "showPassword",
        displayName: "Show Password",
        value: false
    });

    public savedPassword = new formattingSettings.TextInput({
        name: "savedPassword",
        displayName: "Saved Password",
        value: "",
        placeholder: ""
    });

    public name: string = "passwordSettings";
    public displayName: string = "Password Settings";
    public slices: Array<FormattingSettingsSlice> = [this.password, this.showPassword, this.savedPassword];
}

/**
 * Filter Settings Card
 */
class FilterSettingsCard extends FormattingSettingsCard {
    public organizationMapping = new formattingSettings.TextInput({
        name: "organizationMapping",
        displayName: "Organization Password Mapping",
        value: JSON.stringify({
            "FAO123": "FAO",
            "UNICEF123": "UNICEF",
            "UNHCR123": "UNHCR",
            "WHO123": "WHO",
            "WIPO123": "WIPO"
        }, null, 2),
        placeholder: '{"password1":"FAO","password2":"UNICEF"}'
    });

    public adminPassword = new formattingSettings.TextInput({
        name: "adminPassword",
        displayName: "Admin Password",
        value: "",
        placeholder: "Enter admin password to view all data"
    });

    public name: string = "filterSettings";
    public displayName: string = "Filter Settings";
    public slices: Array<FormattingSettingsSlice> = [this.organizationMapping, this.adminPassword];
}

/**
 * Navigation Settings Card (for reference - bookmarks cannot be triggered programmatically)
 */
class NavigationSettingsCard extends FormattingSettingsCard {
    public successBookmarkName = new formattingSettings.TextInput({
        name: "successBookmarkName",
        displayName: "Success Bookmark Name (Reference Only)",
        value: "",
        placeholder: "e.g., 'Access Granted'",
        description: "⚠️ Note: Power BI API does not support programmatic bookmark triggering. Use buttons with PasswordValid measure filter instead."
    });

    public name: string = "navigationSettings";
    public displayName: string = "Navigation Settings";
    public slices: Array<FormattingSettingsSlice> = [this.successBookmarkName];
}

/**
 * Visual formatting settings model
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    public general: GeneralSettingsCard = new GeneralSettingsCard();
    public passwordSettings: PasswordSettingsCard = new PasswordSettingsCard();
    public filterSettings: FilterSettingsCard = new FilterSettingsCard();
    public navigationSettings: NavigationSettingsCard = new NavigationSettingsCard();
    public cards = [this.general, this.passwordSettings, this.filterSettings, this.navigationSettings];
}

