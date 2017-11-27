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
import MostPopularShows from './MostPopularShows';
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
      popularShows: []
    };
  }

  componentDidMount() {
    const url = new URL(window.location.href);
    if (url.searchParams) {
      const sid = url.searchParams.get('sid');
      if (sid) {
        this.getDetails({ value: sid });
      }
    } else {
      mixpanel.track('Entered start page');
    }
    this.findMostPopularShows()
  }

  findMostPopularShows = () => {
    const showLimit = 3
    return axios
      .get(`http://wsgapi.msroed.io/popular?limit=${showLimit}`)
      .then(response => {
        this.setState({popularShows: response.data})
      })
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
      const show = response.data
      mixpanel.track('Watched show', {
        title: show.Title,
        imdbID: value,
      });
      this.setState({
        selectedShowRatings: show.episodes,
        value: {
          id: show.imdbID,
          title: show.Title,
          posterURL: show.Poster,
          seasons: show.totalSeasons,
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
    const fromRange = this.state.range[0]
    const toRange = this.state.range[1]
    return (this.state.selectedShowRatings || []).filter(
      show => {
        if (fromRange === 0) return true
        return show.imdbRating > fromRange && show.imdbRating <= toRange 
    });
  };

  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  render() {
    const selectedShowRatings = this.showRatingsfilteredByRange();
    const { modalOpen, range, value, loading, selectedEpisode, popularShows } = this.state;
    let bubbleStyle = {}
    if (value) {
      const maxEpisode = selectedShowRatings.reduce((acc, curr) => curr.episode > acc ? curr.episode : acc, 0)
      bubbleStyle = {height: Math.max(400, 100 + (30 * maxEpisode)), maxWidth: Math.max(400, 50 + (40 * value.seasons))}
    }
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
        <div style={bubbleStyle} className="content">
          <BubbleChart
            selectedShowRatings={selectedShowRatings}
            range={range}
            value={value}
            loading={loading}
            didPressElementAtIndex={this.showModal}
          />
        </div>
        { popularShows.length > 0 && 
          <MostPopularShows popularShows={popularShows} setSelectedShow={this.setValue} />
        }
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
