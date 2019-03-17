import { TurnContext, ConversationState,  BotAdapter, BotFrameworkAdapter } from "botbuilder";
import { QnAMaker, LuisRecognizer } from "botbuilder-ai";
import { DialogSet, WaterfallDialog, ChoicePrompt, WaterfallStepContext, PromptOptions, WaterfallStep } from "botbuilder-dialogs";
import { BlobStorage } from "botbuilder-azure";
import { saveRef, subscribe } from "./proactive";

export class EcohBot {
  private conversationState: ConversationState;
  private _qnAMaker: QnAMaker;
  private _luis: LuisRecognizer;
  private _dialogs: DialogSet;
  private _blobStorage: BlobStorage;
  private _adapter: BotFrameworkAdapter;


  async onTurnEcho(context: TurnContext, qnAMaker: QnAMaker) {
    if (context.activity.type === "message") {
      const state = this.conversationState.get(context);
      await context.sendActivity(`You said ${context.activity.text}`);
    } else {
      await context.sendActivity(`${context.activity.type} event detected`);
    }
  }

  async onTurnQna(context: TurnContext, qnAMaker: QnAMaker) {
    if (context.activity.type === "message") {
      const qnaResults = await this._qnAMaker.generateAnswer(context.activity.text);
      if (qnaResults.length > 0) {
        await context.sendActivity(qnaResults[0].answer);
      }
    } else {
      await context.sendActivity(`${context.activity.type} event detected`);
    }
  }

  async onTurnLuis(context: TurnContext, qnAMaker: QnAMaker, luis: LuisRecognizer) {
    if (context.activity.type === "message") {
      const qnaResults = await this._qnAMaker.generateAnswer(context.activity.text);
      if (qnaResults.length > 0) {
        await context.sendActivity(qnaResults[0].answer);
      } else {
        await this._luis.recognize(context).then((res) => {
          const top = LuisRecognizer.topIntent(res);
          context.sendActivity(`The top intend found was ${top}`);
        })
      }
    } else {
      await context.sendActivity(`${context.activity.type} event detected`);
    }
  }
  async onTurnDialog(context: TurnContext, qnAMaker: QnAMaker, dialogs: DialogSet) {
    const dc = await this._dialogs.createContext(context);
    await dc.continueDialog();
    if (context.activity.text != null && context.activity.text == "alert") {
      await dc.beginDialog("alert");
    } else if (context.activity.type === "message") {
      const qnaResults = await this._qnAMaker.generateAnswer(context.activity.text);
      if (qnaResults.length > 0) {
        await context.sendActivity(qnaResults[0].answer);
      }
    } else {
      await context.sendActivity(`${context.activity.type} event detected`);
    }
    await this.conversationState.saveChanges(context);
  }


  async onTurn(context: TurnContext) {
    const dc = await this._dialogs.createContext(context);
    await dc.continueDialog();
    if (context.activity.text != null && context.activity.text == "alert") {
      await dc.beginDialog("alert");
    } else if (context.activity.type === "message") {
      const userId: string = await saveRef(TurnContext.getConversationReference(context.activity),this._blobStorage);
      await subscribe(userId,this._blobStorage,this._adapter);
      const qnaResults = await this._qnAMaker.generateAnswer(context.activity.text);
      if (qnaResults.length > 0) {
        await context.sendActivity(qnaResults[0].answer);
      }
    } else {
      await context.sendActivity(`${context.activity.type} event detected`);
    }
    await this.conversationState.saveChanges(context);
  }

  constructor(conversationState: ConversationState, qnAMaker: QnAMaker, dialogs: DialogSet,
    blobStorage: BlobStorage, adapter: BotFrameworkAdapter) {
    this.conversationState = conversationState;
    this._qnAMaker = qnAMaker;
    this._dialogs = dialogs;
    this._adapter = adapter;
    this._blobStorage = blobStorage;
    this.addDialogs();
  }

  private addDialogs() {
    this._dialogs.add(new WaterfallDialog("alert", [
      async (step: WaterfallStepContext) => {
        const choices = ["Set To Zero", "Action Later"];
        const options: PromptOptions = {
          prompt: "SOH Mismatch for 15311, Do you like to perform anyone of the following options?",
          choices: choices
        }
        return await step.prompt("choicePrompt", options);
      }, async (step: WaterfallStepContext) => {
        console.log(step);
        const choices = ["Yes", "No"];
        const options: PromptOptions = {
          prompt: "Do you wish to continue?",
          choices: choices
        }
        return await step.prompt("choicePrompt", options);
      }, async (step: WaterfallStepContext) => {
        console.log(step);
        await step.context.sendActivity(`you have selected "${step.result.value}"`);
        /* switch (step.result.index) {
          case 0:
            console.log(step);
            await step.context.sendActivity(`you have selected ${step.parent.context} ${step.result.index}`)
            break;
          case 0:
            await step.context.sendActivity("")
            break;
          default:
            break;
        } */
        return await step.endDialog();
      }
    ]));

    this._dialogs.add(new ChoicePrompt("choicePrompt"));
  }
}