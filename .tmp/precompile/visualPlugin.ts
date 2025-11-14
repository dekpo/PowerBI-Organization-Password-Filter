import { OrganizationPasswordFilter } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var organizationPasswordFilter1234567890ABCDEF: IVisualPlugin = {
    name: 'organizationPasswordFilter1234567890ABCDEF',
    displayName: 'Organization Password Filter',
    class: 'OrganizationPasswordFilter',
    apiVersion: '5.3.0',
    create: (options?: VisualConstructorOptions) => {
        if (OrganizationPasswordFilter) {
            return new OrganizationPasswordFilter(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["organizationPasswordFilter1234567890ABCDEF"] = organizationPasswordFilter1234567890ABCDEF;
}
export default organizationPasswordFilter1234567890ABCDEF;