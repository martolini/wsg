import React from 'react'
const mixpanel = window.mixpanel;

const MostPopularShows = ({popularShows, setSelectedShow}) => (
  <div>
    <h3>Most popular shows:</h3>
    <div className='row'>
      <div className='col-sm-3'/>
      { popularShows.map((show, i) => <ShowView setSelectedShow={setSelectedShow} key={show.imdb_id} {...show} />)}
    </div>
  </div>
)

const ShowView = ({title, imdb_rating, imdb_id, setSelectedShow, poster_url}) => (
  <div className='col-sm-2' onClick={() => {
    setSelectedShow({value: imdb_id});
    window.scrollTo(0, 0);
    mixpanel.track('Clicked on most popular', {
      title
    });
  }}>
    <div className='card border-dark'>
      <img className='card-img-top' height='100' width='auto' src={poster_url} alt='' style={{objectFit: 'cover', objectPosition: 'top'}}/>
      <div className='card-body'>
        <h5 className='card-title'>{title}</h5> 
        <i className='fa fa-star fa-lg' style={{color: '#f7c61f'}} aria-hidden='true' />
        <span className='lead'> {imdb_rating}</span>
      </div>
    </div>
  </div>
)

export default MostPopularShows;