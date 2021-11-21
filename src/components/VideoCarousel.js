import { Carousel } from 'antd';
import VideoGrid from './VideoGrid';

const VideoCarousel = props => {
  // remap peerConnections to slides
  const videoCounts = 4; // how many videos in 1 slide
  const sliderCounts = Math.ceil(props.peerConnections.length / videoCounts);
  const peerConnectionSlides = [...new Array(sliderCounts)].map((_, index) => props.peerConnections.slice(index*videoCounts, index*videoCounts + videoCounts));
  return (
    <Carousel>
      {peerConnectionSlides.map((peerConnections, index) => <VideoGrid key={index} peerConnections={peerConnections}/>)}
    </Carousel>
  )
}

export default VideoCarousel;