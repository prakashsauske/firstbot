"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
function createHeroCard(data, topIntent) {
    return botbuilder_1.CardFactory.heroCard("", botbuilder_1.CardFactory.images([""]), botbuilder_1.CardFactory.actions([
        {
            type: "openUrl",
            title: "Read More...",
            value: ""
        }
    ]));
}
exports.createHeroCard = createHeroCard;
//# sourceMappingURL=cards.js.map