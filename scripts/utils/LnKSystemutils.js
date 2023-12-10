import {cModuleName, cDelimiter} from "./LnKutils.js";

//system names
const cPf2eName = "pf2e"; //name of Pathfinder 2. edition system
const cPf1eName = "pf1"; //name of Pathfinder 1. edition system
const cDnD5e = "dnd5e"; //name of D&D 5e system
const cDnD35e = "D35E"; //name of the D&D 3.5e system
const cAdvanced5e = "a5e"; //name of the advanced D&D 5e system
const cStarFinderName = "sfrpg"; //name of Starfinder system
const c13thage = "archmage"; //name of the 13th age system
const cCoC7 = "CoC7"; //name of call of cthulhu 7 system
const cWarhammer4e = "wfrp4e"; //name of the warhammer 4e system
const cDarkEye5e = "dsa5"; //name of the black eye 5e system
const cBitD = "blades-in-the-dark"; //name of the blades in the dark system
const cCyberpunkRED = "cyberpunk-red-core"; //name of the cyberpunk red core system
const cSandbox = "sandbox"; //name of the sandbox system
const cWarhammerFRP4e = "wfrp4e"; //name of the warhammer fantasy roleplaying 4e system
const cCoC7e = "CoC7"; //name of the Call of Cthulhu system 7th edition
const cDSA5 = "dsa5"; //name of the Das schwarze Auge system (5e)

//Tokentype
const cPf2eLoottype = "loot"; //type of loot tokens in Pf2e

const Pf2eSkillDictionary = {
    acr: "acrobatics",
    arc: "arcana",
    ath: "athletics",
    cra: "crafting",
    dec: "deception",
    dip: "diplomacy",
    itm: "intimidation",
    med: "medicine",
    nat: "nature",
    occ: "occultism",
    prf: "performance",
    rel: "religion",
    soc: "society",
    ste: "stealth",
    sur: "survival",
    thi: "thievery"
}

//Lock Types
const cLockTypeLootPf2e = "LTLootPf2e"; //type for Token

export { cPf2eLoottype, cLockTypeLootPf2e }

//takes care of system specific stuff
class LnKSystemutils {
	//DELCARATIONS	
	//Identification
	static isPf2e() {} //used for special Pf2e functions
	
	//system defaults
	static Systemdefaultitemtype() {} //returns the default type of item for keys in the current system
	
	static SystemdefaultLockPickItem() {} //returns the default Lock Pick item in the current system
	
	static SystemdefaultLPformula() {} //returns the default formula for Lock Picking in the current system	
	
	static SystemdefaultLBformula() {} //returns the default formula for Lock breaking in the current system	
	
	static SystemdefaultPickPocketformula() {} //returns the default formula for pick pocketing in the current system
	
	static SystemInventory(pToken) {} //returns the inventory of pToken in the current system
	
	static SystemFreeCircumventdefaultKeyword() {} //returns the default key word for Free Circumvents
	
	static isFreeCircumvent(pMessage) {} //returns if pMessage causes a free circumvent
	
	static ResettoStandardFormulas(pResets = {pLP : true, pLB : true}) {} //resets the formulas to the standard formulas
	
	//rolls
	static isSystemPerceptionRoll(pMessage, pInfos) {} //returns if the message belongs to a perception roll
	
	//IMPLEMENTATIONS
	//Identification	
	static isPf2e() {
		return game.system.id === cPf2eName;
	}
	
	//system defaults
	static Systemdefaultitemtype() {
		switch (game.system.id) {
			case cPf2eName:
				return "equipment";
				break;
			case cDnD5e:
				return "tool";
			case cDnD35e:
				return "equipment";
			case cStarFinderName:
				return "technological";
				break;
			case cAdvanced5e:
				return "object";
				break;
			case c13thage:
				return "tool";
				break;
			case cCoC7:
				return "item";
				break;
			case cWarhammer4e:
				return "cargo";
				break;
			case cDarkEye5e:
				return "equipment";
				break;
			case cPf1eName:
				return "equipment";
				break;
			case cBitD:
				return "item";
				break;
			case cCyberpunkRED:
				return "gear";
				break;
			case cSandbox:
				return "cItem";
				break;
			default:
				//default fall backs
				if (game.items) {
					if (game.items.documentClass.TYPES.includes("object")) {
						return "object"
					}
					if (game.items.documentClass.TYPES.includes("item")) {
						return "item"
					}
					if (game.items.documentClass.TYPES.includes("tool")) {
						return "tool"
					}
					if (game.items.documentClass.TYPES.includes("equipment")) {
						return "equipment"
					}
					if (game.items.documentClass.TYPES.includes("gear")) {
						return "gear"
					}
					return game.items.documentClass.TYPES[0];
				}
				break;
		}
		
		return "";
	}
	
	static SystemdefaultLockPickItem() {
		switch (game.system.id) {
			case cPf2eName:
				return "zvLyCVD8g2PdHJAc;6nrCxNQFycUVFOV2;Ejmv9IHGp9Ad9dgu;QnuL1UEot8ptWNb1;spqcRLBsMOC9WTcd;fprUZviW8khm2BLo;AFE073UYI0mkWuUs";
				break;
			case cDnD5e:
				return "woWZ1sO5IUVGzo58";
				break;
			case cDnD35e:
				return "JPR4dAKnUbJFsvMi;JPR4dAdnUbJFsvMi";
				break;
			case cPf1eName:
				return "Tools, Thieves'";
				break;
			default:
				return "";
		}		
	}
	
	static SystemdefaultLPformula() {
		switch (game.system.id) {
			case cPf2eName:
				return "1d20 + @actor.skills.thievery.mod";
				break;
			case cDnD5e:
				return "1d20 + @actor.system.abilities.dex.mod + @actor.system.tools.thief.prof.flat + @actor.system.tools.thief.bonus";
				break;
			case cDnD35e:
				return "1d20 + @actor.system.skills.opl.mod";
				break;
			case cStarFinderName:
				return "1d20 + @actor.system.skills.eng.mod";
				break;
			case cPf1eName:
				return "1d20 + @actor.system.skills.dev.mod";
				break;
			case cWarhammer4e:
				return "1d100 - @actor.characteristics.dex.value";
				break;
			case cCoC7e:
				return "1d100/@actor.system.skills.Locksmith.value";
				break;
			case cDSA5:
				return "1d20 @actor.system.characteristics.in + 1d20 @actor.system.characteristics.ff + 1d20 @actor.system.characteristics.ff";
				break;
			default:
				return "";
		}
	}
	
	static SystemdefaultLBformula() {
		switch (game.system.id) {
			case cPf2eName:
				return "1d20 + @actor.skills.athletics.mod - 2";
				break;
			case cDnD5e:
				return "1d20 + @actor.system.abilities.str.mod + @actor.system.skills.ath.prof.flat";
				break;
			case cDnD35e:
				return "1d20 + @actor.system.abilities.str.mod";
				break;
			case cStarFinderName:
				return "1d20 + @actor.system.skills.ath.mod";
				break;
			case cPf1eName:
				return "1d20 + @actor.system.abilities.str.mod";
				break;
			case cCoC7e:
				return "1d100/@actor.system.characteristics.str.value";
				break;
			default:
				return "";
		}		
	}
	
	static SystemdefaultPickPocketformula() {
		switch (game.system.id) {
			case cPf2eName:
				return "1d20 + @actor.skills.thievery.mod";
				break;
			case cDnD5e:
				return "1d20 + @actor.system.abilities.dex.mod + @actor.system.skills.slt.prof.flat";
				break;
			case cDnD35e:
				return "1d20 + @actor.system.skills.slt.mod";
				break;
			case cStarFinderName:
				return "1d20 + @actor.system.skills.sle.mod";
				break;
			case cPf1eName:
				return "1d20 + @actor.system.skills.slt.mod";
				break;
			default:
				return "";
		}		
	}
	
	static SystemInventory(pToken) {
		switch (game.system.id) {
			case cSandbox:
				return pToken.actor.system.citems.map(vItem => game.items.get(vItem.id) || game.items.get(vItem.ciKey)).filter(vItem => vItem);
			default:
				return pToken.actor.items;
		}
	}
	
	static SystemFreeCircumventdefaultKeyword() {
		switch (game.system.id) {
			case cDnD5e:
				return "Knock";
			default:
				return "";
		}		
	}
	
	static isFreeCircumvent(pMessage) {
		if (game.settings.get(cModuleName, "LockCircumventName").length > 0) {
			return game.settings.get(cModuleName, "LockCircumventName").split(cDelimiter).includes(pMessage.flavor);
		}
		else {
			return false;
		}
	}
	
	static async ResettoStandardFormulas(pResets = {pLP : true, pLB : true, pPP : true}) {
		if (pResets.pLP) {
			await game.settings.set(cModuleName, "LockPickFormula", LnKSystemutils.SystemdefaultLPformula());
		}
		
		if (pResets.pLB) {
			await game.settings.set(cModuleName, "LockBreakFormula", LnKSystemutils.SystemdefaultLBformula());
		}
		
		if (pResets.pPP) {
			await game.settings.set(cModuleName, "PickPocketFormula", LnKSystemutils.SystemdefaultPickPocketformula());
		}
	}
	
	//rolls
	static isSystemPerceptionRoll(pMessage, pInfos) {
		if (pMessage.isRoll) {
			let vSystemInfo = pMessage.flags?.[game.system.id];
			
			let vSkill = "";
			
			if (vSystemInfo) {
				switch (game.system.id) {
					case cPf2eName:
						vSkill = Object.keys(Pf2eSkillDictionary).find(vKey => Pf2eSkillDictionary[vKey] == vSystemInfo?.modifierName);
						
						pInfos["skill"] = vSkill;
						
						return vSystemInfo.context?.type == "perception-check";
						break;
					case cDnD5e:
						pInfos["skill"] = vSystemInfo.roll.skillId;
					
						return vSystemInfo.roll.skillId == "prc";
						break;
					case cPf1eName:
						pInfos["skill"] = vSystemInfo.subject?.skill;
					
						return vSystemInfo.subject?.skill == "per";
						break;
					default : 
						return pMessage.flavor.includes(game.settings.get(cModuleName, "PerceptionKeyWord"));
						break;
				}
			}
		}
		else {
			//key word recognition
		}
		
		return false;
	}
	
	static canAutodetectSystemPerceptionRoll() {
		return [cPf2eName, cDnD5e, cPf1eName].includes(game.system.id);
	}
}

export function ResettoStandardFormulas(pResets = {pLP : true, pLB : true, pPP : true}) {LnKSystemutils.ResettoStandardFormulas(pResets)};

export { LnKSystemutils }