import { ConversationReference,BotAdapter, TurnContext, BotFrameworkAdapter } from "botbuilder";
import { BlobStorage } from "botbuilder-azure";

export async function saveRef(ref : Partial<ConversationReference>, storage : BlobStorage): Promise<string>{
  const changes = [];
  console.log(ref.activityId);
  changes[`references/${ref.activityId}`] = ref;
  await storage.write(changes);
  console.log('write done');
  return Promise.resolve(ref.activityId);
}

export async function subscribe(userid: string, storage : BlobStorage, adapter : BotFrameworkAdapter): Promise<any>{
  setTimeout(async()=>{
    console.log(userid);
    const ref = await getRef(userid,storage);
    console.log(ref);
    if(ref){
      await adapter.continueConversation(ref, async(context : TurnContext) => {
        console.log(context);
        await context.sendActivity('You got an new alert');
      });
    }
  },1000)
}

async function getRef(userid: string, storage: BlobStorage) : Promise<any>{
  const key = `references/${userid}`;
  var ref = await storage.read([key]);
  console.log('read done');
  return Promise.resolve([ref[key]]);
}