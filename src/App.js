import React, { Component } from 'react';
import './App.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import axios from 'axios';
import Slider from 'rc-slider';

import { ValueComponent, OptionComponent } from './MenuComponents';
import BubbleChart from './BubbleChart';
import EpisodeModal from './EpisodeModal';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

const mixpanel = window.mixpanel;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      imdbID: '',
      range: [5, 10],
      selectedShowRatings: undefined,
      loading: false,
      selectedEpisode: {},
    };
  }

  componentDidMount() {
    const url = new URL(window.location.href);
    if (url.searchParams) {
      const sid = url.searchParams.get('sid');
      if (sid) {
        this.getDetails({ value: sid });
      }
    }
  }

  getOptions = input => {
    if (input.length <= 1) {
      return Promise.resolve();
    }
    this.setState({ loading: true });
    return axios
      .get(`http://wsgapi.msroed.io/search`, {
        params: {
          s: input,
          type: 'series',
        },
      })
      .then(response => {
        this.setState({ loading: false });
        return {
          options: response.data.Search.map(ss => ({
            label: ss.Title,
            value: ss.imdbID,
            title: ss.Title,
            posterURL: ss.Poster,
          })),
        };
      });
  };

  getDetails = ({ value }) => {
    this.setState({ loading: true });
    axios.get(`http://wsgapi.msroed.io/get/${value}`).then(response => {
      mixpanel.track('Watched show', {
        title: response.data.Title,
        imdbID: value,
      });
      this.setState({
        selectedShowRatings: response.data.episodes,
        value: {
          title: response.data.Title,
          posterURL: response.data.Poster,
        },
        loading: false,
      });
    });
  };

  setValue = value => {
    if (value) {
      window.history.pushState(
        '',
        '',
        `${window.location.origin}?sid=${value.value}`
      );
      this.getDetails(value);
    }
  };

  setRange = value => {
    this.setState({ range: value });
  };

  showModal = selectedIndex => {
    mixpanel.track('Clicked episode');
    this.setState({ modalOpen: true });
    const showRatings = this.showRatingsfilteredByRange();
    const imdbID = showRatings[selectedIndex].imdbID;
    this.setState({ loading: true });
    return axios.get(`http://wsgapi.msroed.io/get/${imdbID}`).then(response => {
      this.setState({ selectedEpisode: response.data, loading: false });
    });
  };

  showRatingsfilteredByRange = () => {
    return (this.state.selectedShowRatings || []).filter(
      show =>
        show.imdbRating > this.state.range[0] &&
        show.imdbRating <= this.state.range[1]
    );
  };

  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  render() {
    const selectedShowRatings = this.showRatingsfilteredByRange();
    const { modalOpen, range, value, loading, selectedEpisode } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Watch something good</h1>
          <h4>Based on IMDB ratings</h4>
        </header>
        <div className="select-field">
          <span className="small">Search any show:</span>
          <Select.Async
            placeholder="Select a show.."
            name="form-field-name"
            value={value}
            onChange={this.setValue}
            loadOptions={this.getOptions}
            optionComponent={OptionComponent}
            valueComponent={ValueComponent}
            optionClassName="option-component"
          />
        </div>
        <div className="range-wrapper-style">
          <Range
            min={0}
            max={10}
            defaultValue={[5, 10]}
            step={0.5}
            onChange={this.setRange}
            tipFormatter={value => `${value}`}
          />
        </div>
        <p>
          Showing results with score between {range[0]} and {range[1]}.{' '}
        </p>
        {value && <p>Click on an episode to view details.</p>}
        <div className="content">
          <BubbleChart
            selectedShowRatings={selectedShowRatings}
            range={range}
            value={value}
            loading={loading}
            didPressElementAtIndex={this.showModal}
          />
        </div>
        <footer className="footer">
          <p>
            Using the{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.omdbapi.com/"
            >
              OMDb API
            </a>.
          </p>
        </footer>
        <EpisodeModal
          selectedEpisode={selectedEpisode}
          toggleModal={this.toggleModal}
          modalOpen={modalOpen}
          loading={loading}
        />
      </div>
    );
  }
}

export default App;
