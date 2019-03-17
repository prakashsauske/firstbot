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
const restivy = require("restify");
const bot_1 = require("./bot");
const botbuilder_ai_1 = require("botbuilder-ai");
const botframework_config_1 = require("botframework-config");
const dotenv_1 = require("dotenv");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_azure_1 = require("botbuilder-azure");
dotenv_1.config();
const botconfg = botframework_config_1.BotConfiguration.loadSync("./firstbot.bot", process.env.BOT_FILE_SECRET);
const blobStorage = new botbuilder_azure_1.BlobStorage({
    containerName: process.env.CONTAINER,
    storageAccessKey: process.env.STORAGEKEY,
    storageAccountOrConnectionString: process.env.STORAGENAME
});
let server = restivy.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening on ${server.url}`);
});
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const conversationState = new botbuilder_1.ConversationState(blobStorage);
const dialogs = new botbuilder_dialogs_1.DialogSet(conversationState.createProperty("dialogState"));
const qnAMaker = new botbuilder_ai_1.QnAMaker({
    knowledgeBaseId: botconfg.findServiceByNameOrId("SampleWowQna").kbId,
    endpointKey: botconfg.findServiceByNameOrId("SampleWowQna").endpointKey,
    host: botconfg.findServiceByNameOrId("SampleWowQna").hostname
});
adapter.onTurnError = (context, error) => __awaiter(this, void 0, void 0, function* () {
    console.error(`\n [onTurnError]: ${error}`);
    context.sendActivity(`Oops. Something went wrong!`);
    yield conversationState.clear(context);
    yield conversationState.saveChanges(context);
});
const bot = new bot_1.EcohBot(conversationState, qnAMaker, dialogs, blobStorage, adapter);
server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        yield bot.onTurn(context);
    }));
});
//# sourceMappingURL=app.js.map