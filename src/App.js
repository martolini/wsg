import React, { Component } from 'react';
import './App.css';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

import Select from 'react-select';
// Be sure to include styles at some point, probably during your bootstrapping
import 'react-select/dist/react-select.css';
import axios from 'axios'
import Slider from 'rc-slider';

import {ValueComponent, OptionComponent} from './MenuComponents'
import BubbleChart from './BubbleChart'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {searchText: "", imdbID: '', range: [0,10], selectedShowRatings: undefined, loading: false, selectedEpisode: {}}
    const url = new URL(window.location.href)
    const sid = url.searchParams.get('sid')
    if (sid) {
      this.getDetails({value: sid})
    }
  }


  getOptions = (input) => {
    if (input.length > 1) {
      this.setState({loading: true})
      return axios.get(`http://wsgapi.msroed.io/search`, {params: {
        s: input,
        type: 'series'
      }})
        .then((response) => {
          this.setState({loading: false})
          return { options: response.data.Search.map(ss => ({
            label: ss.Title, 
            value: ss.imdbID, 
            title: ss.Title,
            posterURL: ss.Poster
          })) };
        });
      } else {
        return Promise.resolve()
      }
  }

  getDetails = ({value}) => {
    return axios.get(`http://wsgapi.msroed.io/get/${value}`)
      .then((response) => {
        this.setState({selectedShowRatings: response.data.episodes, value: {title: response.data.Title, posterURL: response.data.Poster}})
        return response
      });
  }

  setValue = (value) => {
    if (value) {
      window.history.pushState("","",`${window.location.origin}?sid=${value.value}`)
      this.getDetails(value)
    }
  }

  setRange = (value) => {
    this.setState({range: value})
  }

  showModal = (selectedIndex) => {
    this.setState({modalOpen: true})
    const imdbID = this.state.selectedShowRatings.filter(show => show.imdbRating > this.state.range[0] && show.imdbRating <= this.state.range[1])[selectedIndex].imdbID
    return axios.get(`http://wsgapi.msroed.io/get/${imdbID}`)
      .then((response) => {
        this.setState({selectedEpisode: response.data})
      })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Watch something good</h1>
          <h4>Based on IMDB ratings</h4>
        </header>
        <div className="select-field">
          <Select.Async
            placeholder="Select a show.."
            name="form-field-name"
            value={this.state.value}
            onChange={this.setValue}
            loadOptions={this.getOptions}
            optionComponent={OptionComponent}
            valueComponent={ValueComponent}
            optionClassName="option-component"
          /></div>
          <div className="range-wrapper-style">
            <Range 
              min={0} 
              max={10} 
              defaultValue={[0, 10]} 
              step={0.5} 
              onChange={this.setRange} 
              tipFormatter={value => `${value}`} />
          </div>
          <p>Showing results with score between {this.state.range[0]} and {this.state.range[1]}</p>
          <div className="content">
            <BubbleChart selectedShowRatings={(this.state.selectedShowRatings || []).filter(show => show.imdbRating > this.state.range[0] && show.imdbRating <= this.state.range[1])} range={this.state.range} value={this.state.value} loading={this.state.loading} didPressElementAtIndex={this.showModal}/>
          </div>
          <footer className="footer"><p>Using the <a target="_blank" rel="noopener noreferrer" href="http://www.omdbapi.com/">OMDb API</a>.</p></footer>
          <Modal isOpen={this.state.modalOpen} toggle={() => this.setState({modalOpen: false})}>
            <ModalHeader toggle={() => this.setState({modalOpen: false})}>
              S{this.state.selectedEpisode.Season}E{this.state.selectedEpisode.Episode} {this.state.selectedEpisode.Title}
            </ModalHeader>
            <ModalBody>
              <img className="img img-responsive" alt="buu" src={this.state.selectedEpisode.Poster} />
              <p>{this.state.selectedEpisode.Plot}</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => this.setState({modalOpen: false})}>Close</Button>
            </ModalFooter>
          </Modal>
      </div>
    );
  }
}

export default App;
