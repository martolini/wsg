import React, {Component} from 'react'
import {scalePow as scalingFunction} from 'd3-scale'
import RC2 from 'react-chartjs2';

const chartOptions = {
  scales: {
    xAxes: [{
      scaleLabel: {display: true, labelString: 'Season'},
      ticks: {
        stepSize: 1,
        min: 1,
        padding: 10
      }
    }],
    yAxes: [{
      scaleLabel: {display: true, labelString: 'Episode'},
      ticks: {
        stepSize: 1,
        min: 1,
        padding: 10
      }
  }]
  },
  tooltips: {
    callbacks: {
      title: function(tooltipItem, data) {
        const curr = data.datasets[0].data[tooltipItem['0'].index]
        return `S${curr.x}E${curr.y} - rating: ${curr.rating}`
      },
      label: function(tooltipItem, data) {
        const curr = data.datasets[0].data[tooltipItem.index]
        return `${curr.title}`
      }
    },
    backgroundColor: '#fff',
    titleFontSize: 17,
    titleFontColor: '#000',
    bodyFontColor: '#000',
    bodyFontSize: 14,
    displayColors: false,
    bodyFontFamily: "Cabin Sketch",
    titleFontFamily: "Cabin Sketch",
    borderColor: '#333',
    borderWidth: 1.5
  },
  layout: {
    padding: {
      top: 50,
      bottom: 50
    }
  },
  legend: {
    display: false
  },
  maintainAspectRatio: false
}

class BubbleChart extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.selectedShowRatings.length === 0) return false;
    const currentTitle = (this.props.value) ? this.props.value.title : ''
    if(currentTitle === nextProps.value.title && (this.props.range[0] === nextProps.range[0] && this.props.range[1] === nextProps.range[1])) return false;
    return true
  }

	render() {
    if (this.props.selectedShowRatings.length === 0 || !this.props.value || this.props.loading) {
      return (
        <p>Select a TV show you want to watch.. </p>
        )
    }
    const selectedShowRatings = this.props.selectedShowRatings
    const minValue = selectedShowRatings.reduce((acc,curr) => curr.imdbRating ? Math.min(acc,curr.imdbRating) : acc, 10)
    const maxValue = selectedShowRatings.reduce((acc,curr) => curr.imdbRating ? Math.max(acc,curr.imdbRating) : acc, 0)
    const scale = scalingFunction().domain([minValue, maxValue]).range([2,12]).exponent(10)
    const scaleColor = scalingFunction().domain([minValue, maxValue]).range([0,1])
    const chartData = {
      datasets: [{
        label: this.props.value.title,
        data: selectedShowRatings.map(show => ({x: show.season, y: show.episode, r: scale(show.imdbRating), rating: show.imdbRating, title: show.Title, imdbID: show.imdbID})),
        backgroundColor: selectedShowRatings.map(show => `rgba(255,99,132,${scaleColor(show.imdbRating)})`),
        hoverBackgroundColor: '#FF6384',
      }]
    };
    return (
      <RC2 ref={ref => this.chartRef = ref} data={chartData} type='bubble' options={chartOptions} onClick={(e) => {
        const activeelems = this.chartRef.chart.getElementsAtEvent(e)
        if (activeelems.length === 0) {
          return
        }
        this.props.didPressElementAtIndex(activeelems[0]._index)
      }}/>
      )

  }
}

export default BubbleChart;