import { useLocation, useParams } from 'react-router'


const VisualizerId = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { initialImage, name } = (location.state as VisualizerLocationState) || {};
    return (
        <section>
            <h1>{name || "Untitled Project"}</h1>
            <div className="visualizer">
                {initialImage && (
                    <div className="image-container">
                        <h2>Source Image</h2>
                        <img src={initialImage} alt="source" />
                    </div>
                )}
            </div>
        </section>
    )
}

export default VisualizerId
