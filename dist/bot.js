"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const proactive_1 = require("./proactive");
class EcohBot {
    onTurnEcho(context, qnAMaker) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === "message") {
                const state = this.conversationState.get(context);
                yield context.sendActivity(`You said ${context.activity.text}`);
            }
            else {
                yield context.sendActivity(`${context.activity.type} event detected`);
            }
        });
    }
    onTurnQna(context, qnAMaker) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === "message") {
                const qnaResults = yield this._qnAMaker.generateAnswer(context.activity.text);
                if (qnaResults.length > 0) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
            }
            else {
                yield context.sendActivity(`${context.activity.type} event detected`);
            }
        });
    }
    onTurnLuis(context, qnAMaker, luis) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === "message") {
                const qnaResults = yield this._qnAMaker.generateAnswer(context.activity.text);
                if (qnaResults.length > 0) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
                else {
                    yield this._luis.recognize(context).then((res) => {
                        const top = botbuilder_ai_1.LuisRecognizer.topIntent(res);
                        context.sendActivity(`The top intend found was ${top}`);
                    });
                }
            }
            else {
                yield context.sendActivity(`${context.activity.type} event detected`);
            }
        });
    }
    onTurnDialog(context, qnAMaker, dialogs) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = yield this._dialogs.createContext(context);
            yield dc.continueDialog();
            if (context.activity.text != null && context.activity.text == "alert") {
                yield dc.beginDialog("alert");
            }
            else if (context.activity.type === "message") {
                const qnaResults = yield this._qnAMaker.generateAnswer(context.activity.text);
                if (qnaResults.length > 0) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
            }
            else {
                yield context.sendActivity(`${context.activity.type} event detected`);
            }
            yield this.conversationState.saveChanges(context);
        });
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = yield this._dialogs.createContext(context);
            yield dc.continueDialog();
            if (context.activity.text != null && context.activity.text == "alert") {
                yield dc.beginDialog("alert");
            }
            else if (context.activity.type === "message") {
                const userId = yield proactive_1.saveRef(botbuilder_1.TurnContext.getConversationReference(context.activity), this._blobStorage);
                yield proactive_1.subscribe(userId, this._blobStorage, this._adapter);
                const qnaResults = yield this._qnAMaker.generateAnswer(context.activity.text);
                if (qnaResults.length > 0) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
            }
            else {
                yield context.sendActivity(`${context.activity.type} event detected`);
            }
            yield this.conversationState.saveChanges(context);
        });
    }
    constructor(conversationState, qnAMaker, dialogs, blobStorage, adapter) {
        this.conversationState = conversationState;
        this._qnAMaker = qnAMaker;
        this._dialogs = dialogs;
        this._adapter = adapter;
        this._blobStorage = blobStorage;
        this.addDialogs();
    }
    addDialogs() {
        this._dialogs.add(new botbuilder_dialogs_1.WaterfallDialog("alert", [
            (step) => __awaiter(this, void 0, void 0, function* () {
                const choices = ["Set To Zero", "Action Later"];
                const options = {
                    prompt: "SOH Mismatch for 15311, Do you like to perform anyone of the following options?",
                    choices: choices
                };
                return yield step.prompt("choicePrompt", options);
            }), (step) => __awaiter(this, void 0, void 0, function* () {
                console.log(step);
                const choices = ["Yes", "No"];
                const options = {
                    prompt: "Do you wish to continue?",
                    choices: choices
                };
                return yield step.prompt("choicePrompt", options);
            }), (step) => __awaiter(this, void 0, void 0, function* () {
                console.log(step);
                yield step.context.sendActivity(`you have selected "${step.result.value}"`);
                return yield step.endDialog();
            })
        ]));
        this._dialogs.add(new botbuilder_dialogs_1.ChoicePrompt("choicePrompt"));
    }
}
exports.EcohBot = EcohBot;
//# sourceMappingURL=bot.js.map