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
const baseUrlApi = 'https://wsgapi.msroed.io';
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
    this.loadSeries(this.props);
  }

  loadSeries = currentProps => {
    const { showid, episodeid } = currentProps.match.params;
    if (showid !== undefined) {
      this.getDetails({ value: showid });
      if (episodeid !== undefined) {
        this.showModal(episodeid);
      }
    }
  };

  getOptions = input => {
    if (input.length <= 1) {
      return Promise.resolve();
    }
    this.setState({ loading: true });
    return axios
      .get(`${baseUrlApi}/search`, {
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
    axios.get(`${baseUrlApi}/get/${value}`).then(response => {
      if (response.data.Response === 'False') {
        return;
      }
      const show = response.data;
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
          rating: show.imdbRating,
        },
        loading: false,
      });
    });
  };

  setValue = value => {
    if (value) {
      this.props.history.push(`/${value.value}`);
    }
  };

  setRange = value => {
    this.setState({ range: value });
  };

  selectShow = selectedIndex => {
    const showRatings = this.showRatingsfilteredByRange();
    const imdbID = showRatings[selectedIndex].imdbID;
    this.props.history.push(`/${this.props.match.params.showid}/${imdbID}`);
    this.showModal(imdbID);
  };

  showModal = imdbID => {
    this.setState({ modalOpen: true, loading: true });
    return axios.get(`${baseUrlApi}/get/${imdbID}`).then(response => {
      mixpanel.track('Clicked episode', {
        title: response.data.Title,
        show: this.props.match.params.showid,
      });
      this.setState({ selectedEpisode: response.data, loading: false });
    });
  };

  showRatingsfilteredByRange = () => {
    const fromRange = this.state.range[0];
    const toRange = this.state.range[1];
    return (this.state.selectedShowRatings || []).filter(show => {
      if (fromRange === 0) return true;
      return show.imdbRating > fromRange && show.imdbRating <= toRange;
    });
  };

  toggleModal = () => {
    if (this.state.modalOpen) {
      this.props.history.push(`/${this.props.match.params.showid}`);
    }
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  render() {
    const selectedShowRatings = this.showRatingsfilteredByRange();
    const { modalOpen, range, value, loading, selectedEpisode } = this.state;
    let bubbleStyle = {};
    if (value) {
      const maxEpisode = selectedShowRatings.reduce(
        (acc, curr) => (curr.episode > acc ? curr.episode : acc),
        0
      );
      bubbleStyle = {
        height: Math.max(400, 100 + 30 * maxEpisode),
        maxWidth: Math.max(400, 50 + 40 * value.seasons),
      };
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
            autoFocus
            placeholder="Select a show.."
            name="form-field-name"
            value={value}
            onChange={this.setValue}
            loadOptions={this.getOptions}
            optionComponent={OptionComponent}
            valueComponent={ValueComponent}
            closeOnSelect={true}
            optionClassName="option-component"
            clearable={false}
          />
        </div>
        {value && (
          <div>
            <div className="range-wrapper-style">
              <Range
                min={0}
                max={10}
                defaultValue={range}
                step={0.5}
                onChange={this.setRange}
                tipFormatter={value => `${value}`}
              />
            </div>
            <p>
              Showing results with score between {range[0]} and {range[1]}.{' '}
            </p>
            <p>Click on an episode to view details.</p>
          </div>
        )}
        <div style={bubbleStyle} className="content">
          <BubbleChart
            selectedShowRatings={selectedShowRatings}
            range={range}
            value={value}
            loading={loading}
            didPressElementAtIndex={this.selectShow}
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
