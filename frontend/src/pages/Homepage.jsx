import './styles/HomePage.css'
import '../components/VideoList';
import VideoList from "../components/VideoList";

export default function HomePage() {

    return (
        <div className="home-page">           
            <VideoList />
        </div>
    )
}