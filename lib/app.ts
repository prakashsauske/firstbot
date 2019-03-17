import { BotFrameworkAdapter, MemoryStorage, ConversationState } from "botbuilder";
import * as restivy from "restify";
import { EcohBot } from "./bot";
import { QnAMaker, LuisRecognizer } from "botbuilder-ai";
import { IQnAService, BotConfiguration, ILuisService } from "botframework-config"
import { config } from "dotenv";
import { DialogSet } from "botbuilder-dialogs";
import { BlobStorage } from "botbuilder-azure";

config();
const botconfg = BotConfiguration.loadSync("./firstbot.bot", process.env.BOT_FILE_SECRET);

const blobStorage = new BlobStorage({
  containerName: process.env.CONTAINER,
  storageAccessKey: process.env.STORAGEKEY,
  storageAccountOrConnectionString: process.env.STORAGENAME
});

let server = restivy.createServer();

server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening on ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});


//const conversationState = new ConversationState(new MemoryStorage());

const conversationState = new ConversationState(blobStorage);

const dialogs = new DialogSet(conversationState.createProperty("dialogState"));


const qnAMaker = new QnAMaker({
  knowledgeBaseId: (<IQnAService>botconfg.findServiceByNameOrId("SampleWowQna")).kbId,
  endpointKey: (<IQnAService>botconfg.findServiceByNameOrId("SampleWowQna")).endpointKey,
  host: (<IQnAService>botconfg.findServiceByNameOrId("SampleWowQna")).hostname
  //"subscriptionKey": "073f94b7-7212-4483-8e82-a5f31f5ac889",
});

/* const luis = new LuisRecognizer({
  applicationId : (<ILuisService> botconfg.findServiceByNameOrId("sampleLuis")).appId,
  endpoint:(<ILuisService> botconfg.findServiceByNameOrId("sampleLuis")).getEndpoint(),
  endpointKey : (<ILuisService> botconfg.findServiceByNameOrId("sampleLuis")).subscriptionKey
}) */


// Catch-all for any unhandled errors in your bot.
adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  console.error(`\n [onTurnError]: ${error}`);
  // Send a message to the user
  context.sendActivity(`Oops. Something went wrong!`);
  // Clear out state
  await conversationState.clear(context);
  // Save state changes.
  await conversationState.saveChanges(context);
};

const bot: EcohBot = new EcohBot(conversationState, qnAMaker, dialogs,blobStorage,adapter);
server.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await bot.onTurn(context);
  });
});
