"use strict";

const { shell } = require("electron");

let config = {
    hieroPath: "",
    fontPath: "",

    exportName: "",
    exportDir: "",

    /** 导出文本来源 0:输入框 1:txt文件 */
    textFrom: 0,
    textStr: "",
    textPath: "",

    fontSize: 32,
    padding: 5,
    scale: 10,
    width: 1024,
    height: 1024
};

Editor.Panel.extend({
    style: `
        :host {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            position: relative;
            box-sizing: border-box;
            contain: content;
            color: #bdbdbd;
            cursor: default;
        }

        .section {
            margin: 10px;
            padding: 0 10px;
            flex: 1;
            overflow-y: auto;
        }

        .footer {
            border-top: 1px solid #666;
            display: block;
            padding: 15px 0;
            margin: 0 20px;
            justify-content: flex-end;
        }

        .end-area {
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
    `,

    template: `
        <div class="section">
            <ui-prop name="Hiero JAR Path" class="flex-1" tabindex="-1">
                <ui-input id="hieroPath" placeholder="Hiero JAR path..." class="flex-2" tabindex="-1"></ui-input>
                <ui-button id="btnHiero" class="tiny" tabindex="-1">...</ui-button>
                <ui-button id="btnDownload" class="tiny" tabindex="-1">Download</ui-button>
            </ui-prop>

            <ui-prop name="Source Font" class="flex-1" tabindex="-1">
                <ui-input id="fontPath" placeholder="font path..." class="flex-2" tabindex="-1"></ui-input>
                <ui-button id="btnFontPath" class="tiny" tabindex="-1">...</ui-button>
            </ui-prop>

            <ui-prop name="Export Directory" class="flex-1" tabindex="-1">
                <ui-input id="exportDir" placeholder="export path..." class="flex-2" tabindex="-1"></ui-input>
                <ui-button id="btnExportDir" class="tiny" tabindex="-1">...</ui-button>
            </ui-prop>
            <ui-prop name="Export Name" class="flex-1" tabindex="-1">
                <ui-input id="exportName" placeholder="export font name..." class="flex-1" tabindex="-1"></ui-input>
            </ui-prop>

            <ui-prop name="Export Text" class="flex-1" tabindex="-1">
                <ui-select id="textSelect" value="0">
                    <option value="0">Custom Input</option>
                    <option value="1">Text File</option>
                </ui-select>
            </ui-prop>
            <ui-prop id="textStr" name="Custom Input Box" type="string" value="" multiline auto-height class="flex-1" tabindex="1"></ui-prop>
            <ui-prop id="textPathElement" name="TextFile" class="flex-1" tabindex="1">
                <ui-input id="textPath" placeholder="txt path..." class="flex-2" tabindex="2"></ui-input>
                <ui-button id="btnTextPath" class="tiny" tabindex="-1">...</ui-button>
            </ui-prop>

            <ui-prop name="Font Parameters" class="flex-1" tabindex="-1">
                <ui-prop id="fontSize" name="Font Size" type="number" value="32" class="flex-1" tabindex="-1"></ui-prop>
                <ui-prop id="padding" name="Padding" type="number" value="5" class="flex-1" tabindex="-1"></ui-prop>
            </ui-prop>
            <ui-prop name="Texture Parameter" class="flex-1" tabindex="-1">
                <ui-prop id="width" name="Width" type="number" value="1024" class="flex-1" tabindex="-1"></ui-prop>
                <ui-prop id="height" name="Height" type="number" value="1024" class="flex-1" tabindex="-1"></ui-prop>
            </ui-prop>
            <ui-prop id="scale" name="SDF Scale" type="number" value="10" class="flex-1" tabindex="-1"></ui-prop>
        </div>

        <div class="footer">
            <div class="end-area">
                <ui-button id="btnSave" class="tiny green" tabindex="-1">Save</ui-button>
                <ui-button id="btnExport" class="tiny green" tabindex="-1">Export</ui-button>
            </div>
        </div class="footer">
    `,

    $: {
        hieroPath: "#hieroPath",
        btnHiero: "#btnHiero",
        btnDownload: "#btnDownload",

        fontPath: "#fontPath",
        btnFontPath: "#btnFontPath",

        exportName: "#exportName",
        exportDir: "#exportDir",
        btnExportDir: "#btnExportDir",

        textSelect: "#textSelect",
        textStr: "#textStr",
        textPathElement: "#textPathElement",
        textPath: "#textPath",
        btnTextPath: "#btnTextPath",

        fontSize: "#fontSize",
        padding: "#padding",
        scale: "#scale",
        width: "#width",
        height: "#height",

        btnSave: "#btnSave",
        btnExport: "#btnExport",
    },

    ready() {
        // 初始化
        Editor.Ipc.sendToMain("textmeshpro-tool:onPanelInit");

        // 事件监听
        this.$btnExportDir.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onClickBtnExportDir");
        });

        this.$btnFontPath.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onClickBtnFontPath");
        });

        this.$btnHiero.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onClickBtnHiero");
        });
        this.$btnDownload.addEventListener("confirm", () => {
            shell.openExternal("https://libgdx.com/wiki/tools/hiero");
        });

        this.$exportName.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "exportFileName", this.$exportName.value);
        });
        this.$textSelect.addEventListener("confirm", () => {
            this.$textStr.style.display = Number(this.$textSelect.value) === 0 ? "" : "none";
            this.$textPathElement.style.display = Number(this.$textSelect.value) === 1 ? "" : "none";
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "textFrom", Number(this.$textSelect.value));
        });
        this.$textStr.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "textStr", this.$textStr.value);
        });
        this.$btnTextPath.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onClickBtnTextPath");
        });
        this.$fontSize.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "fontSize", this.$fontSize.value);
        });
        this.$padding.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "padding", this.$padding.value);
        });
        this.$scale.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "scale", this.$scale.value);
        });
        this.$width.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "width", this.$width.value);
        });
        this.$height.addEventListener("confirm", () => {
            Editor.Ipc.sendToMain("textmeshpro-tool:onChangeConfig", "height", this.$height.value);
        });

        let saveCall = () => {
            config.exportName = this.$exportName.value;
            config.exportDir = this.$exportDir.value;
            config.fontPath = this.$fontPath.value;
            config.hieroPath = this.$hieroPath.value;
            config.textFrom = Number(this.$textSelect.value);
            config.textStr = this.$textStr.value;
            config.textPath = this.$textPath.value;
            config.fontSize = this.$fontSize.value;
            config.padding = this.$padding.value;
            config.scale = this.$scale.value;
            config.width = this.$width.value;
            config.height = this.$height.value;
            Editor.Ipc.sendToMain("textmeshpro-tool:onClickBtnSave", config);
        };

        this.$btnSave.addEventListener("confirm", () => {
            saveCall();
        });
        this.$btnExport.addEventListener("confirm", () => {
            saveCall();
            Editor.Ipc.sendToMain("textmeshpro-tool:onClickBtnExport");
        });
    },

    listeners: {
        mousedown(event) {
            event.stopPropagation();
        },

        "panel-resize"(event) {
            event.stopPropagation();
        }
    },

    messages: {
        refreshConfig(event, arg) {
            config = arg;
            this.$exportName.value = config.exportName;
            this.$exportDir.value = config.exportDir;
            this.$fontPath.value = config.fontPath;
            this.$hieroPath.value = config.hieroPath;

            this.$textSelect.value = config.textFrom;
            this.$textStr.style.display = Number(this.$textSelect.value) === 0 ? "" : "none";
            this.$textPathElement.style.display = Number(this.$textSelect.value) === 1 ? "" : "none";
            this.$textStr.value = config.textStr;
            this.$textPath.value = config.textPath;

            this.$fontSize.value = config.fontSize;
            this.$padding.value = config.padding;
            this.$scale.value = config.scale;
            this.$width.value = config.width;
            this.$height.value = config.height;
        }
    }
});
