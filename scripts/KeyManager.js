import { cModuleName, Translate, LnKutils, cLUuseKey, cLUusePasskey, cLUchangePasskey, cLUIdentity, cLUaddIdentity, cLUpickLock, cLUbreakLock, cLUCustomCheck, cLUFreeCircumvent } from "./utils/LnKutils.js";
import { Geometricutils } from "./utils/Geometricutils.js";
import { cLockTypeDoor, cLockTypeLootPf2e } from "./utils/LnKutils.js";
import { LnKFlags } from "./helpers/LnKFlags.js";
import { LnKPopups } from "./helpers/LnKPopups.js";
import { LnKSound } from "./helpers/LnKSound.js";
import { cCustomPopup } from "./helpers/LnKFlags.js";
import { LnKSystemutils} from "./utils/LnKSystemutils.js";

const cLnKKeyIcon = "fa-key";
const cLnKPasswordIcon = "fa-regular fa-pen-to-square";
const cLnKChangePasswordIcon = "fa-solid fa-pen";
const cLnKIdentityIcon = "fa-solid fa-address-card";
const cLnKPickLockIcon = "fa-solid fa-toolbox";
const cLnKBreakLockIcon = "fa-solid fa-hammer";
const cLnKCancelIcon = "fa-solid fa-xmark";
const cLnKFreeCircumventIcon = "fa-solid fa-wand-magic-sparkles";
const cLnKCustomCheckIcon = "fa-solid fa-dice-d20";

//does everything Key related (including lock picks, they are basically keys, right?)
class KeyManager {
	//DECLARATIONS
	static async onatemptedLockuse(pLockObject, pUseType, pFallBack = true) {} //called if a player tries to use a lock
	
	static async onatemptedKeyuse(pLockObject, pUseType, pCharacter, pFallBack = true) {} //called if a player tries to usa a key on pLockObject 
	
	static async onatemptedcircumventLock(pLockObject, pUseType, pCharacter) {} //called if a player tries to circumvent pLockObject using pUsetype [cLUpickLock, cLUbreakLock, cLUCustomCheck]
	
	static requestLockuse(puseData) {} //send a request to use Lock acording to pData
	
	static async ChangePasswordofLock(pLock) {} //opens change password dialog for hovered lock
	
	static async AddIdentitytoLock(pLock, pIdentityTypes = [], pOptions = {}) {} //requests identity addition to pLock
	
	//support
	static async cancircumventLock(pCharacter, pLock, puseMethod) {} //if pCharacter can circumvent pLock using puseMethod
	
	static async circumventLockroll(pCharacter, pLock, puseMethod, pRollData) {} //the (best) roll used to circumvent pLock using puseMethod
	
	static KeyItems(pInventory) {} //returns all Key items in pInventory
	
	//ui
	static createPasskeyDialog(pLockObject, pLockType, pCharacter, pPasswordChange = false) {} //used to creat the passkey dialog
	
	static async createLockuseDialog(pLockObject) {} //used to create a popup with use options

	static addKeyHUD() {} //called to add Key icon to token HUD 
	
	static onKeyContext(pHTML, pButtons) {} //adds buttons to item context
	
	//ons
	static onLockRightClick(pDocument, pInfos) {} //called when a lock is RightClicked
		
	static onChatMessage(pMessage, pInfos, pSender) {} //called when a chat message is registered
	
	//IMPLEMENTATIONS
	static async onatemptedLockuse(pLockObject, pUseType, pFallBack = true) {
		let vCharacter = LnKutils.PrimaryCharacter();
		let vProblemPopup = "";
		
		if (vCharacter && pLockObject) {
			if (LnKFlags.LockDCtype(pLockObject, pUseType) == Infinity) {
				//Lock cant be picked/broken => possible popup message
				switch (pUseType) {
					case cLUpickLock:
						vProblemPopup = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LocknotPickable);
						break;
					case cLUbreakLock:
						vProblemPopup = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LocknotBreakable);
						break;
					case cLUCustomCheck:
						vProblemPopup = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LocknotCustom);
						break;					
				}
			}
			
			if (vProblemPopup.length) {
				LnKPopups.TextPopUp(pLockObject, vProblemPopup); //MESSAGE POPUP
			}
			else {
				if (LnKFlags.isLockable(pLockObject)) {
					//check if pLockObject is even Lockable
					
					if (LnKutils.WithinLockingDistance(vCharacter, pLockObject)) {
						//check if lock is in reach
						switch (pUseType) {
							case cLUuseKey:
							case cLUusePasskey:
							case cLUIdentity:
							case cLUFreeCircumvent:
								KeyManager.onatemptedKeyuse(pLockObject, pUseType, vCharacter, pFallBack);
								break;
							case cLUpickLock:
							case cLUbreakLock:
							case cLUCustomCheck:
								let vAllowCheck = game.settings.get(cModuleName, "allowallInteractions");
								
								if (!vAllowCheck) {
									switch (pUseType) {
										case cLUpickLock:
											vAllowCheck = LnKFlags.canbePicked(pLockObject);
											
											if (!vAllowCheck) {
												LnKPopups.TextPopUpID(pLockObject, "CantbePicked"); //MESSAGE POPUP
											}
											break;
										case cLUbreakLock:
											vAllowCheck = LnKFlags.canbeBroken(pLockObject);
											
											if (!vAllowCheck) {
												LnKPopups.TextPopUpID(pLockObject, "CantbeBroken"); //MESSAGE POPUP
											}
											break;
										case cLUCustomCheck:
											vAllowCheck = LnKFlags.canbeCustomChecked(pLockObject);
											
											if (!vAllowCheck) {
												LnKPopups.TextPopUpID(pLockObject, "CantbeCustomChecked", {pCheckName : game.settings.get(cModuleName, "CustomCircumventName")}); //MESSAGE POPUP
											}
											break;
									}
								}
							
								if (vAllowCheck) {
									KeyManager.onatemptedcircumventLock(pLockObject, pUseType, vCharacter);
								}
								break;
						}
					}
					else {
						LnKPopups.TextPopUpID(pLockObject, "Lockoutofreach", {pLockName : pLockObject.name}); //MESSAGE POPUP
					}
				}
			}
			/*
			else {
				LnKPopups.TextPopUpID(pLockObject, "NotaLock", {pLockName : pLockObject.name}); //MESSAGE POPUP
			}
			*/
		}
	}
	
	static async onatemptedKeyuse(pLockObject, pUseType, pCharacter, pFallBack = true) {	
		let vKeyItems;
		let vFittingKey;
		let vLockType = await LnKutils.Locktype(pLockObject);
		
		switch (pUseType) {
			case cLUIdentity:
				if (pLockObject && pCharacter) {
					let vUser = game.user;
					
					let vMatchingIdentity = LnKFlags.MatchingIdentity(pLockObject, pCharacter, vUser);
					
					if (vMatchingIdentity) {
						let vData = {useType : cLUIdentity, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, IdentityMatch : vMatchingIdentity};
						KeyManager.requestLockuse(vData);
					}
					else {
						if (pFallBack) {
							KeyManager.onatemptedKeyuse(pLockObject, cLUuseKey, pCharacter);
						}
						else {
							LnKPopups.TextPopUpID(pLockObject, "WrongIdentity"); //MESSAGE POPUP
						}
					}
				}
				break;
			case cLUuseKey:
				if (pLockObject && pCharacter) {
					//vKeyItems = await KeyManager.KeyItems(await LnKutils.TokenInventory(pCharacter, true));
					vKeyItems = await LnKutils.TokenInventory(pCharacter, true);
					
					//only key which contains keyid matching at least one key id of pLockObject fits
					vFittingKey = vKeyItems.find(vKey => LnKFlags.matchingIDKeys(vKey, pLockObject, game.settings.get(cModuleName, "UseKeynameasID")));				
					
					if (vFittingKey) {	
						let vData = {useType : cLUuseKey, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, KeyItemID : vFittingKey.id};
						KeyManager.requestLockuse(vData);
					}
					else {
						let vnoKeyMessage = true;
						
						if (pFallBack) {
							if (LnKFlags.hasFreeLockCircumvent(pCharacter)) {
								//use free circumvent if available
								KeyManager.onatemptedKeyuse(pLockObject, cLUFreeCircumvent, pCharacter);
								
								vnoKeyMessage = false;
							}
							else {
								if (LnKFlags.HasPasskey(pLockObject)) {
									//no key item => use Passkey
									KeyManager.onatemptedKeyuse(pLockObject, cLUusePasskey, pCharacter);
									
									vnoKeyMessage = false;
								}
							}
						}
						
						if (vnoKeyMessage) {
							LnKPopups.TextPopUpID(pLockObject, "nomatchingKey"); //MESSAGE POPUP
						}
					}
				}
				break;
			case cLUFreeCircumvent:
				if (LnKFlags.hasFreeLockCircumvent(pCharacter)) {
					let vData = {useType : cLUFreeCircumvent, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id};
					KeyManager.requestLockuse(vData);					
				}
				break;
			case cLUusePasskey:
				if (LnKFlags.HasPasskey(pLockObject)) {
					KeyManager.createPasskeyDialog(pLockObject, vLockType, pCharacter);
				}
				break;
		}
	}
	
	static async onatemptedcircumventLock(pLockObject, pUseType, pCharacter) {
		let vRoll;
		let vRollFormula = "";
		let vLockType = await LnKutils.Locktype(pLockObject);
		let vUsedItemID;
		let vCircumvent;
		let vCallback;
			
		if (pCharacter) {
			
			vCircumvent = await KeyManager.cancircumventLock(pCharacter, pLockObject, pUseType); //will save if circumvention possible and the item
			if (vCircumvent) {
				
				if (!game.settings.get(cModuleName, "usePf2eSystem") || (pUseType == cLUCustomCheck)) {
					//get rollformula and used item (for roll formula)
					[vRollFormula, vUsedItemID] = await KeyManager.circumventLockroll(pCharacter, pLockObject, pUseType);
					
					if (vUsedItemID.length <= 0 && vCircumvent.id) {
						//no special item was found but vCircumvent is item with id, so fall back to vCircumvent
						vUsedItemID = vCircumvent.id;
					}
					
					//roll dice according to formula
					vRoll =  LnKutils.createroll(vRollFormula, pCharacter.actor, LnKFlags.LockDCtype(pLockObject, pUseType));
					
					LnKSound.PlayDiceSound(pCharacter);
					
					await vRoll.evaluate();
					
					Hooks.callAll(cModuleName+".DiceRoll", pUseType, pCharacter, vRoll);
					
					//ouput dice result in chat
					switch (pUseType) {
						case cLUpickLock:
							await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockPick", {pName : pCharacter.name}),rolls : [vRoll], type : 5}); //CHAT MESSAGE
							break;
						case cLUbreakLock:
							await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.LockBreak", {pName : pCharacter.name}),rolls : [vRoll], type : 5}); //CHAT MESSAGE
							break;
						case cLUCustomCheck:
							await ChatMessage.create({user: game.user.id, flavor : Translate("ChatMessage.CustomCheck", {pName : pCharacter.name, pCheckName : game.settings.get(cModuleName, "CustomCircumventName")}),rolls : [vRoll], type : 5}); //CHAT MESSAGE
							break;
					}
					
					let vData = {useType : pUseType, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, UsedItemID : vUsedItemID, Rollresult : vRoll.total, Diceresult : LnKutils.diceResults(vRoll)};
					
					KeyManager.requestLockuse(vData);
				}
				else {
					vCallback = async (psuccessdegree) => {
						let vData = {useType : pUseType, SceneID : pLockObject.object.scene.id, Locktype : vLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, UsedItemID : vUsedItemID, useSystemRoll : true, Systemresult : psuccessdegree};
					
						KeyManager.requestLockuse(vData);
					};
					
					LnKSystemutils.systemRoll(pUseType, pCharacter.actor, vCallback, {difficulty : LnKFlags.LockDCtype(pLockObject, pUseType)});
				}			
			}
			else {
				if (pUseType == cLUpickLock) {
					LnKPopups.TextPopUpID(pLockObject, "noLockPickItem"); //MESSAGE POPUP
				}
			}
		}
	}
	
	static requestLockuse(puseData) {
		let vuseData = puseData;
		
		vuseData.userID = game.user.id;
		
		if (game.user.isGM) {
			Hooks.call(cModuleName + ".LockuseRequest", vuseData);
		}
		else {
			game.socket.emit("module."+cModuleName, {pFunction : "LockuseRequest", pData : vuseData});
		}		
	}
	
	static async ChangePasswordofLock(pLock) {
		if (pLock && LnKFlags.isLockable(pLock)) {
			let vCharacter = LnKutils.PrimaryCharacter();
			let vLockType = await LnKutils.Locktype(pLock);
			
			if (LnKutils.WithinLockingDistance(vCharacter, pLock)) {
				if (LnKFlags.PasskeyChangeable(pLock) && LnKFlags.HasPasskey(pLock)) {
					KeyManager.createPasskeyDialog(pLock, vLockType, vCharacter, true);
				}
				else {
					LnKPopups.TextPopUpID(pLock, "CantChangePassword"); //MESSAGE POPUP
				}
			}
			else {
				LnKPopups.TextPopUpID(pLock, "Lockoutofreach", {pLockName : pLock.name}); //MESSAGE POPUP
			}
		}
	} 
	
	static async AddIdentitytoLock(pLock, pIdentityTypes = [], pOptions = {}) {
		let vIdentities = pIdentityTypes;
		
		if (!(vIdentities instanceof Array)) {
			vIdentities = [vIdentities];
		}
		
		if (pLock && vIdentities.length > 0) {
			let vCharacter = LnKutils.PrimaryCharacter();
			let vLockType = await LnKutils.Locktype(pLock);
			
			if (vLockType) {
				if (LnKutils.WithinLockingDistance(vCharacter, pLock)) {
					let vData = {useType : cLUaddIdentity, SceneID : pLock.object.scene.id, Locktype : vLockType, LockID : pLock.id, CharacterID : vCharacter.id, IdentityTypes : vIdentities, options : pOptions}; 
					
					KeyManager.requestLockuse(vData);
				}
				else {
					LnKPopups.TextPopUpID(pLock, "Lockoutofreach", {pLockName : pLock.name}); //MESSAGE POPUP
				}
			}
		}
	}
	
	//support
	static async cancircumventLock(pCharacter, pLock, puseMethod) {
		switch (puseMethod) {
			case cLUpickLock:
				if (LnKFlags.hasSpecialLockpicks(pLock)) {
					return await LnKutils.hasLockPickItem(await LnKutils.TokenInventory(pCharacter, true), LnKFlags.GetSpecialLockpicks(pLock));
				}
				else {
					return await LnKutils.hasLockPickItem(await LnKutils.TokenInventory(pCharacter, true));
				}
				break;
			case cLUbreakLock:
				return true; //no item required
				break;		
			case cLUCustomCheck:
				return game.settings.get(cModuleName, "CustomCircumventActive");
				break;
			default:
				return false;
				break;
		}
	}
	
	static async circumventLockroll(pCharacter, pLock, puseMethod) {
		let vValidItems;
		let vBestItem;
		let vBestItemID = "";
		let vRollFormula = "";
		
		//filter valid items for operation
		vValidItems = (await LnKutils.TokenInventory(pCharacter, true)).filter(vItem => LnKFlags.HasFormula(vItem, puseMethod));
		
		if (vValidItems.length) {
			//find best item		
			vBestItem = vValidItems[await LnKutils.HighestExpectedRollID(vValidItems.map(vItem => LnKFlags.Formula(vItem, puseMethod)), pCharacter.actor)];
			
			//create roll formula
			vRollFormula = LnKFlags.Formula(vBestItem, puseMethod);
		}
		
		if (!vBestItem || !LnKFlags.FormulaOverride(vBestItem, puseMethod)) {
			//no lock pick used or lock pick does not override
			vRollFormula = LnKutils.StitchFormula(LnKFlags.Formula(pCharacter, puseMethod), vRollFormula);
				
			if (!LnKFlags.FormulaOverride(pCharacter, puseMethod)) {
				vRollFormula = LnKutils.StitchFormula(LnKutils.formulaWorld(puseMethod), vRollFormula);
			}
		}
		
		if (!vRollFormula.length) {
			//if nothing has been set
			vRollFormula = "0";
		}
		
		if (vBestItem) {
			vBestItemID = vBestItem.id;
		}
		
		return [vRollFormula, vBestItemID];
	}
	
	static KeyItems(pInventory) {
		return pInventory.filter(vItem => vItem.flags.hasOwnProperty(cModuleName));
	}
	
	//ui
	static async createPasskeyDialog(pLockObject, pLockType, pCharacter, pPasswordChange = false) {
		let vTitle = LnKFlags.getCustomPopups(pLockObject, cCustomPopup.LockPasskeyTitle);
		
		if (!vTitle.length) {
			//revert to default if no custom
			vTitle = Translate("Titles.EnterPasskey");
		}
		
		if (!pPasswordChange) {
			new Dialog({
				title: Translate("Titles.Passkey"),
				content: `<label>${vTitle}</label>
						<input type="text" id="Passkey" name="Passkey">`,
				buttons: {
					confirm: {
						label: Translate("Titles.ConfirmPasskey"),
						callback: (html) => {let vData = {useType : cLUusePasskey, SceneID : pLockObject.object.scene.id, Locktype : pLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, EnteredPasskey : html.find("input#Passkey").val()}; 
											KeyManager.requestLockuse(vData)},
						icon: `<i class="fas ${cLnKKeyIcon}"></i>`
					}
				},
				default: "confirm"
			}).render(true);
		}
		else {
			let vnewPasswordTitle = Translate("Titles.newPasskey");
			
			new Dialog({
				title: Translate("Titles.Passkey"),
				content: `<label>${vTitle}</label>
						<input type="text" id="Passkey" name="Passkey">
						<label>${vnewPasswordTitle}</label>
						<input type="text" id="newPasskey" name="newPasskey">`,
				buttons: {
					confirm: {
						label: Translate("Titles.ConfirmPasskey"),
						callback: (html) => {let vData = {useType : cLUchangePasskey, SceneID : pLockObject.object.scene.id, Locktype : pLockType, LockID : pLockObject.id, CharacterID : pCharacter.id, OldPasskey : html.find("input#Passkey").val(), NewPasskey : html.find("input#newPasskey").val()}; 
											KeyManager.requestLockuse(vData)},
						icon: `<i class="fas ${cLnKKeyIcon}"></i>`
					}
				},
				default: "confirm"
			}).render(true);
		}
	}
	
	static async createLockuseDialog(pLockObject) {
		let vCharacter = LnKutils.PrimaryCharacter();
		let vLockType = await LnKutils.Locktype(pLockObject);
		
		let vshowKey;
		let vshowPassKey;
		let vshowChangePassKey;
		let vshowIdentityKey;
		let vshowPicklock;
		let vshowBreaklock;
		let vshowFreeCircumvent;
		let vshowCustomCheck;
		
		let vButtons = {};
		
		if (LnKutils.WithinLockingDistance(vCharacter, pLockObject)) {
			if (LnKFlags.isLockable(pLockObject)) {
				vshowKey =  LnKFlags.HasKey(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
				vshowPassKey = LnKFlags.HasPasskey(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
				vshowChangePassKey = LnKFlags.PasskeyChangeable(pLockObject) && LnKFlags.HasPasskey(pLockObject);
				vshowIdentityKey = LnKFlags.HasIdentityKey(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
				vshowPicklock = LnKFlags.canbePicked(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
				vshowBreaklock = LnKFlags.canbeBroken(pLockObject) || game.settings.get(cModuleName, "showallLockInteractions");
				vshowFreeCircumvent = (LnKFlags.hasFreeLockCircumvent(vCharacter) && LnKFlags.canbeCircumventedFree(pLockObject)) || game.settings.get(cModuleName, "showallLockInteractions");
				vshowCustomCheck = LnKFlags.canbeCustomChecked(pLockObject) || (game.settings.get(cModuleName, "showallLockInteractions") && game.settings.get(cModuleName, "CustomCircumventActive"));
				
			
				if (vshowFreeCircumvent) {
					vButtons[cLUFreeCircumvent] = {
						label: Translate("Titles." + cLUFreeCircumvent),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUFreeCircumvent);},
						icon: `<i class="fas ${cLnKFreeCircumventIcon}"></i>`
					}		
				}
				
				if (vshowKey) {
					vButtons[cLUuseKey] = {
						label: Translate("Titles." + cLUuseKey),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUuseKey, false);},
						icon: `<i class="fas ${cLnKKeyIcon}"></i>`
					}
				}
				
				if (vshowPassKey) {
					vButtons[cLUusePasskey] = {
						label: Translate("Titles." + cLUusePasskey),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUusePasskey);},
						icon: `<i class="fas ${cLnKPasswordIcon}"></i>`
					}
				}
				
				if (vshowChangePassKey) {
					vButtons[cLUchangePasskey] = {
						label: Translate("Titles." + cLUchangePasskey),
						callback: () => {
							let vCharacter = LnKutils.PrimaryCharacter();
							KeyManager.createPasskeyDialog(pLockObject, vLockType, vCharacter, true);
						},
						icon: `<i class="fas ${cLnKChangePasswordIcon}"></i>`
					}
				}
				
				if (vshowIdentityKey) {
					vButtons[cLUIdentity] = {
						label: Translate("Titles." + cLUIdentity),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUIdentity, false);},
						icon: `<i class="fas ${cLnKIdentityIcon}"></i>`
					}
				}
				
				if (vshowPicklock) {
					vButtons[cLUpickLock] = {
						label: Translate("Titles." + cLUpickLock),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUpickLock);},
						icon: `<i class="fas ${cLnKPickLockIcon}"></i>`
					}
				}
				
				if (vshowBreaklock) {
					vButtons[cLUbreakLock] = {
						label: Translate("Titles." + cLUbreakLock),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUbreakLock);},
						icon: `<i class="fas ${cLnKBreakLockIcon}"></i>`
					}
				}
				
				if (vshowCustomCheck) {
					vButtons[cLUCustomCheck] = {
						label: Translate("Titles." + cLUCustomCheck, {pCheckName : game.settings.get(cModuleName, "CustomCircumventName")}),
						callback: () => {KeyManager.onatemptedLockuse(pLockObject, cLUCustomCheck);},
						icon: `<i class="fas ${cLnKCustomCheckIcon}"></i>`
					}
				}
			}
			
			await Hooks.callAll(cModuleName + ".ObjectInteractionMenu", vButtons, pLockObject, vLockType, vCharacter, game.settings.get(cModuleName, "showallLockInteractions"));
				
			if (Object.keys(vButtons).length) {
				vButtons["Close"] = {
						label: Translate("Titles.Close"),
						callback: () => {},
						icon: `<i class="fas ${cLnKCancelIcon}"></i>`
				}
				
				let vDialog = new Dialog({
					title: Translate("Titles.Lockuse"),
					buttons: vButtons
				}).render(true);
					
				Hooks.once("renderDialog", (pDialog, pHTML, pdata) => {//Token Lock use
					if (pDialog.appID == vDialog.appID) {
						pHTML.find(`div.dialog-buttons`).css("flex-direction", "column"); //make buttons appear as list	
						pHTML.css("height", "max-content"); //resize window
					}
				}); 
			}
		}
		else {
			if (LnKFlags.isLockable(pLockObject)) {
				LnKPopups.TextPopUpID(pLockObject, "Lockoutofreach", {pLockName : pLockObject.name}); //MESSAGE POPUP
			}
		}
	}

	static addKeyHUD(pHUD, pHTML, pToken) {
		let vToken = LnKutils.TokenfromID(pToken._id);
		
		if (vToken) {
			if (LnKFlags.hasFreeLockCircumvent(vToken) && vToken.isOwner) {
				let vButtonPosition = game.settings.get(cModuleName, "FreeCircumventButtonPosition");
				
				if (vButtonPosition != "none") {		
					let vButtonHTML = `<div class="control-icon" data-action="FreeCircumvent"  title="${Translate("Titles.FreeCircumventHUD")}">
										<i class="${cLnKFreeCircumventIcon}"></i>
									</div>`;
					
					pHTML.find("div.col."+vButtonPosition).append(vButtonHTML);
					
					let vButton = pHTML.find(`div[data-action="FreeCircumvent"]`);
					
					vButton.click((pEvent) => {LnKFlags.removeFreeLockCircumvent(vToken)});
				}
			}
		}
	}
	
	static onKeyContext(pHTML, pButtons) {
		pButtons.push({
			name: Translate("Context.KeyCopy"),
			icon: `<i class="fas ${cLnKKeyIcon}"></i>`,
			condition: (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				//handle only key items
				return vItem.flags.hasOwnProperty(cModuleName);
			},
			callback: async (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				LnKFlags.copyIDKeys(vItem);
			}
		});
		
		pButtons.push({
			name: Translate("Context.KeyPaste"),
			icon: `<i class="fas ${cLnKKeyIcon}"></i>`,
			condition: (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				//handle only key items
				return vItem.flags.hasOwnProperty(cModuleName);
			},
			callback: async (pElement) => {
				let vID = pElement.data('document-id');
				let vItem = game.items.find(vItem => vItem.id == vID);
				LnKFlags.pasteIDKeys(vItem);
			}
		});
	} 
	
	//ons
	static onLockRightClick(pDocument, pInfos) {	
		if (!game.user.isGM) {//CLIENT: use key
			if (!game.paused || !game.settings.get(cModuleName, "preventUseinPause")) {//use on pause check	
				switch (game.settings.get(cModuleName, "ControlSceme")) {
					case "ControlSceme-rightKeys" :
						if (LnKFlags.isLockable(pDocument)) {
							if (pInfos.shiftKey) {
								KeyManager.onatemptedLockuse(pDocument, cLUpickLock);
							}
							else {
								if (pInfos.altKey) {
									KeyManager.onatemptedLockuse(pDocument, cLUbreakLock);
								}
								else {
									KeyManager.onatemptedLockuse(pDocument, cLUIdentity, true);
								}
							}
						}
						break;
					case "ControlSceme-rightPopups" :
					default:
						if (!pInfos.shiftKey && !pInfos.altKey && !pInfos.ctrlKey) {
							KeyManager.createLockuseDialog(pDocument);
						}
						break;
				}
			}
			else {
				LnKPopups.TextPopUpID(pDocument, "GamePaused"); //MESSAGE POPUP
			}
		}
	}

	static onChatMessage(pMessage, pInfos, pSender) {
		if (game.user.id == pSender) {
			if (LnKSystemutils.isFreeCircumvent(pMessage)) {
				let vToken = canvas.tokens.get(pMessage.speaker.token)?.document;
				
				if (vToken) {
					LnKFlags.giveFreeLockCircumvent(vToken);
				}
			}
		}
	}
}

//Hooks
Hooks.on(cModuleName + "." + "DoorRClick", (pDoorDocument, pInfos) => {//Door Lock use
	KeyManager.onLockRightClick(pDoorDocument, pInfos);
});

Hooks.on(cModuleName + "." + "TokenRClick", (pTokenDocument, pInfos) => {//Token Lock use
	KeyManager.onLockRightClick(pTokenDocument, pInfos);
}); 

Hooks.on("createChatMessage", (pMessage, pInfos, pSender) => {
	KeyManager.onChatMessage(pMessage, pInfos, pSender);
});

Hooks.on("renderTokenHUD", (...args) => KeyManager.addKeyHUD(...args));

Hooks.on('getItemDirectoryEntryContext', KeyManager.onKeyContext); //register Key context

//wrap export macro functions
function UseKeyonHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUuseKey, true); };

function ChangePasswordHoveredLock() { return KeyManager.ChangePasswordofLock(LnKutils.hoveredObject()); };

function AddIdentitytoHoveredLock(pTypes, pOptions = {}) { return KeyManager.AddIdentitytoLock(LnKutils.hoveredObject(), pTypes, pOptions);};

function AddIdentitytoLock(pLock, pTypes, pOptions = {}) { return KeyManager.AddIdentitytoLock(pLock, pTypes, pOptions = {});}

function PickHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUpickLock); };

function BreakHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUbreakLock); };

function CustomCheckHoveredLock() { return KeyManager.onatemptedLockuse(LnKutils.hoveredObject(), cLUCustomCheck); }

export { UseKeyonHoveredLock, ChangePasswordHoveredLock, AddIdentitytoHoveredLock, AddIdentitytoLock, PickHoveredLock, BreakHoveredLock, CustomCheckHoveredLock }