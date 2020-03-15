import { Component } from '@angular/core'
import { Minion } from '@models/minion.model'
import { GameService } from '@services/game.service'
import { LocStorageService } from '@services/loc-storage.service'
import { LoggerService } from '@services/logger.service'
import { NameGeneratorService } from '@services/name-gen.service'

@Component({
	// selector: 'ag-game',
	styleUrls: ['./game.component.scss'],
	templateUrl: './game.component.html'
})
export class GameComponent {
	constructor(
		private readonly locStorageService: LocStorageService,
		private readonly nameGenService: NameGeneratorService,
		public readonly loggerService: LoggerService,
		public readonly gameService: GameService) {}

	public onClearLogs() {
		this.loggerService.clearLogs()
	}

	public onGenerateCoin() {
		this.gameService.generateCoin()
	}

	public onMinionHealed(minionIndex: number) {
		this.gameService.healMinion(minionIndex)
	}

	public onMinionRefunded(minionIndex: number) {
		const minion = this.gameService.minions[minionIndex]
		const refundAmount = Math.round(LocStorageService.EXCHANGE_RATE_MINION * .75)

		this.loggerService.log(`🚼- ${minion.name} refunded. Earned coin: ${refundAmount}`)

		this.gameService.removeMinion(minionIndex)
		this.gameService.coins += refundAmount
	}

	public onSummonMinion() {
		const newMinion = new Minion()
		newMinion.name = this.nameGenService.generateName()

		this.loggerService.log(`👶⁜ Summoned minion, ${newMinion.name}: ${JSON.stringify(newMinion)}`)

		this.gameService.addMinion(newMinion)
		this.gameService.coins -= LocStorageService.EXCHANGE_RATE_MINION
	}

	public onQuestCompleted(minion: Minion, minionIndex: number) {
		const dmgChance = Math.round(Math.random() * 3)
		const earnedAmount = this.gameService.numSoldiers + minion.attack
		const constructedMsg: string[] = []
		const newXP = Math.round(1 + Math.random() * 2)

		constructedMsg.push(`💰$ ${minion.name} completed a quest. Earned coin: ${earnedAmount}. Earned XP: ${newXP}`)
		minion.addXp(newXP)

		if (dmgChance > 2) {
			const dmg = Math.round(1 + Math.random() * 2)

			constructedMsg.push(`\t🤺⚔ ${minion.name} takes damage: ${dmg}`)

			minion.takeDamage(dmg)

			if (minion.hitpointsRemaining === 0) {
				constructedMsg.push(`\t\t💀☠ ${minion.name} has retired due to fatigue`)
				this.gameService.removeMinion(minionIndex)
			} else {
				constructedMsg.push(`\t\t💖♥ But ${minion.name} lives to fight another day w/ ${minion.hitpointsRemaining} hitpoints left`)
			}
		} else {
			constructedMsg.push(`\t💖♥ ${minion.name} ventures on untouched w/ ${minion.hitpointsRemaining} hitpoints left`)
		}

		this.loggerService.logMulti(constructedMsg)

		this.locStorageService.saveMinions(this.gameService.minions)
		this.gameService.coins += earnedAmount
	}
}
