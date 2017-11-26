import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const EpisodeModal = ({selectedEpisode, toggleModal, modalOpen, loading}) => (
	<Modal isOpen={modalOpen} toggle={toggleModal}>
    <ModalHeader toggle={toggleModal}>
      { !loading &&
        <p>S{selectedEpisode.Season}E{selectedEpisode.Episode} {selectedEpisode.Title}</p>
      }
    </ModalHeader>
    <ModalBody>
      { loading &&
        <p> loading... </p>
      }
      { !loading &&
        <div>
          <p className="small float-right">Released: {selectedEpisode.Released}</p>
          <img className="img img-responsive" alt="buu" src={selectedEpisode.Poster} />
          <p>{selectedEpisode.Plot}</p>
          <div>
            <table className="table borderless">
              <thead />
              <tbody>
                <tr>
                  <td>Rating:</td>
                  <td>{selectedEpisode.imdbRating}</td>
                </tr>
                <tr>
                  <td>Number of votes:</td>
                  <td>{selectedEpisode.imdbVotes}</td>
                </tr>
                <tr>
                  <td>Duration:</td>
                  <td>{selectedEpisode.Runtime}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <a target="_blank" 
            rel="noopener noreferrer" 
            href={`http://www.imdb.com/title/${selectedEpisode.imdbID}/`}>
              Preview on IMDB
          </a>
        </div>
      }
    </ModalBody>
    <ModalFooter>
      <Button onClick={toggleModal}>Close</Button>
    </ModalFooter>
  </Modal>
)

export default EpisodeModal;