import { Carousel } from 'antd';
import VideoGrid from './VideoGrid';
import VideoShareScreenStream from './VideoShareScreenStream';
import styles from './VideoCarousel.module.css';

const VideoCarousel = props => {
  // remap peerConnections to slides
  const videoCounts = 4; // how many videos in 1 slide
  const sliderCounts = Math.ceil(props.peerConnections.length / videoCounts);
  const peerConnectionSlides = [...new Array(sliderCounts)].map((_, index) => props.peerConnections.slice(index*videoCounts, index*videoCounts + videoCounts));
  const slides = peerConnectionSlides.map((peerConnections, index) => <VideoGrid key={index} peerConnections={peerConnections}/>);
  // if someone is sharing screen
  if(props.sharingScreen) {
    slides.unshift(<VideoShareScreenStream key='share-screen' peerConnections={props.peerConnections} sharingScreen={props.sharingScreen} sharingScreenStream={props.sharingScreenStream} />);
  }
  return (
    <div className={styles.carousel}>
      <Carousel draggable={true}>
        {slides}
      </Carousel>
    </div>
  )
}

export default VideoCarousel;