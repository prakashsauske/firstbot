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
function saveRef(ref, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [];
        console.log(ref.activityId);
        changes[`references/${ref.activityId}`] = ref;
        yield storage.write(changes);
        console.log('write done');
        return Promise.resolve(ref.activityId);
    });
}
exports.saveRef = saveRef;
function subscribe(userid, storage, adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            console.log(userid);
            const ref = yield getRef(userid, storage);
            console.log(ref);
            if (ref) {
                yield adapter.continueConversation(ref, (context) => __awaiter(this, void 0, void 0, function* () {
                    console.log(context);
                    yield context.sendActivity('You got an new alert');
                }));
            }
        }), 1000);
    });
}
exports.subscribe = subscribe;
function getRef(userid, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `references/${userid}`;
        var ref = yield storage.read([key]);
        console.log('read done');
        return Promise.resolve([ref[key]]);
    });
}
//# sourceMappingURL=proactive.js.map