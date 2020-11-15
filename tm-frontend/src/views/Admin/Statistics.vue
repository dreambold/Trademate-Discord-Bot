<template>
	<div>
		<AppCard class="mt-3">
			<h2 class="mt-2 mb-1">Statistics</h2>

			<VMultiselect
				class="mt-4 mr-1"
				v-model="statisticsPane"
				:options="statisticsPaneOptions"
				:allow-empty="false"
				:preselect-first="true"
				track-by="value"
				label="label"
				deselect-label
			>
				<template slot="singleLabel" slot-scope="{ option }">
					Viewing
					<strong>{{ option.label.toLowerCase() }}</strong> statistics
				</template>
			</VMultiselect>

			<VMultiselect
				class="mt-2"
				v-model="statisticsDuration"
				:options="statisticsDurationOptions"
				:allow-empty="false"
				:preselect-first="true"
				:disabled="['various', 'lifetimes'].includes(currentPane)"
				track-by="value"
				label="label"
			></VMultiselect>
		</AppCard>

		<AppCard class="mt-3" v-if="currentPane === 'various'">
			<div v-if="stats.loading" class="text-center">
				<AppLoader></AppLoader>
			</div>
			<div v-else>
				<div class="row mt-1 mb-1">
					<div class="col-lg-4" v-for="(stat, i) in stats.v" :key="i">
						<div class="statistic-container" :class="['statistic-' + stat.slug]">
							<div class="value">{{ stat.value }}</div>
							<div class="text">{{ stat.text }}</div>
						</div>
					</div>
				</div>
			</div>
		</AppCard>

		<AppCard class="mt-3" v-if="currentPane === 'members'">
			<div class="row">
				<div class="col-lg-6">
					<AdminChart
						name="prom"
						:options="{ prom_name: 'members' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:begin-at-zero="false"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="prom"
						:options="{ prom_name: 'members-change' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:colors="['10, 194, 130', '254, 93, 112']"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="prom"
						:options="{ prom_name: 'members-leave-day' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="cohort-events"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:colors="true"
						:color-background="false"
					></AdminChart>
				</div>
			</div>
		</AppCard>

		<AppCard class="mt-3" v-if="currentPane === 'trials'">
			<div class="row">
				<div class="col-lg-6">
					<AdminChart
						name="prom"
						:options="{ prom_name: 'trials' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="prom"
						:options="{ prom_name: 'trials-change' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:colors="['10, 194, 130', '254, 93, 112']"
					></AdminChart>
				</div>
			</div>
		</AppCard>

		<AppCard class="mt-3" v-if="currentPane === 'lifetimes'">
			<div class="row">
				<div class="col-lg-6">
					<AdminChart
						name="lifetimes"
						:options="{ type: 'free', short: 'no' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:color-background="false"
						:colors="true"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="lifetimes"
						:options="{ type: 'free', short: 'yes' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:color-background="false"
						:colors="true"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="lifetimes"
						:options="{ type: 'paid' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:color-background="false"
						:colors="true"
					></AdminChart>
				</div>
			</div>
		</AppCard>

		<AppCard class="mt-3" v-if="currentPane === 'channels'">
			<div class="row">
				<div class="col-lg-6">
					<AdminChart
						name="prom"
						:options="{ prom_name: 'voice-rooms' }"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
					></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart
						name="cohort-channels"
						:start="start"
						:end="end"
						:step="step"
						:round-date="['daily', 'weekly'].includes(statisticsDuration.value)"
						:color="true"
						:color-background="false"
					></AdminChart>
				</div>
			</div>
		</AppCard>

		<AppCard class="mt-3" v-if="currentPane === 'csat'">
			<div class="row">
				<div class="col-lg-6">
					<AdminChart name="csat" :start="start" :end="end" :step="step"></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart name="csat-sample-size" :start="start" :end="end" :step="step"></AdminChart>
				</div>
				<div class="col-lg-6">
					<AdminChart name="csat-rolling-average" :start="start" :end="end" :step="step"></AdminChart>
				</div>
			</div>
		</AppCard>
	</div>
</template>

<script src="./Statistics.js"></script>

<style lang="scss" scoped>
.statistic-container {
	padding: 10px;
	border-radius: 5px;
	overflow: hidden;
	color: white;

	.value {
		font-size: 1.5em;
		font-weight: bold;
	}

	&.statistic-monthly-earnings {
		background: -webkit-gradient(
			linear,
			left top,
			right top,
			from(#0ac282),
			to(#0df3a3)
		);
		background: linear-gradient(to right, #0ac282, #0df3a3);
	}

	&.statistic-customer-churn {
		background: -webkit-gradient(
			linear,
			left top,
			right top,
			from(#fe5d70),
			to(#fe909d)
		);
		background: linear-gradient(to right, #fe5d70, #fe909d);
	}

	&.statistic-member-count {
		background: -webkit-gradient(
			linear,
			left top,
			right top,
			from(#01a9ac),
			to(#01dbdf)
		);
		background: linear-gradient(to right, #01a9ac, #01dbdf);
	}
}
</style>
