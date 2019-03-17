import { SpeakerSession } from "./types";
import { MessageFactory, Activity, CardFactory, Attachment } from "botbuilder";
import { s } from "metronical.proto";
/* 
export function createCarousal(data: SpeakerSession[], topIntent: string ): Partial<Activity> {
  const heroCards = [];
  for(let i = 0;i<data.length;i++){
    heroCards.push(createHeroCard(data[i],topIntent));
  }
} */

export function createHeroCard(data: SpeakerSession, topIntent: string): Attachment {
  return CardFactory.heroCard(
    "",
    CardFactory.images([""]),
    CardFactory.actions([
      {
        type: "openUrl",
        title: "Read More...",
        value: ""
      }
    ])
  );
}