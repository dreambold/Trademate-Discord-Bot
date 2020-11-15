import { Line } from 'vue-chartjs'

function padLeft(str, n, pad = ' ') {
	str = '' + str
	while (str.length < n) str = pad + str

	return str
}

export default {
	props: ['data', 'roundDate', 'colors', 'colorBackground', 'beginAtZero'],
	name: 'RealCohortChart',
	extends: Line,
	mounted() {
		let colors =
			this.colors === true
				? [
						'46, 204, 113',
						'26, 188, 156',
						'52, 152, 219',
						'155, 89, 182',
						'52, 73, 94',
						'241, 196, 15',
						'230, 126, 34',
						'231, 76, 60'
				  ]
				: this.colors || []
		let bg = this.colorBackground ?? true

		this.renderChart(
			{
				labels: this.data[0].data.map(k => {
					if (typeof k[0] !== 'number') return k[0]
					let d = new Date(k[0] * 1000)
					let str =
						d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()

					if (!this.roundDate)
						str +=
							' ' +
							padLeft(d.getHours(), 2, '0') +
							':' +
							padLeft(d.getMinutes(), 2, '0')

					return str
				}),
				datasets: this.data.map((dataset, i) => {
					let color = i < colors.length ? colors[i] : '1, 169, 172'
					return {
						label: dataset.name,
						borderWidth: 2,
						borderColor: 'rgba(' + color + ', 1)',
						backgroundColor:
							'rgba(' + (bg ? color + ', 0.2' : '0, 0, 0, 0') + ')',
						cubicInterpolationMode: 'monotone',
						lineTension: 0,
						data: dataset.data.map(k => k[1])
					}
				})
			},
			{
				responsive: true,
				maintainAspectRatio: false,
				tooltips: {
					intersect: false,
					mode: 'index'
				},
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: this.beginAtZero ?? true
							}
						}
					]
				}
			}
		)
	}
}
