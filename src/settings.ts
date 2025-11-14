"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

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

    public name: string = "passwordSettings";
    public displayName: string = "Password Settings";
    public slices: Array<FormattingSettingsSlice> = [this.password, this.showPassword];
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

    public name: string = "filterSettings";
    public displayName: string = "Filter Settings";
    public slices: Array<FormattingSettingsSlice> = [this.organizationMapping];
}

/**
 * Visual formatting settings model
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    public passwordSettings: PasswordSettingsCard = new PasswordSettingsCard();
    public filterSettings: FilterSettingsCard = new FilterSettingsCard();
    public cards = [this.passwordSettings, this.filterSettings];
}

