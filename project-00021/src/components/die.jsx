export default function Die(props) {
    const styles = {
        backgroundColor: props.isHeld ? "#59E391" : "white"
    }

    const pipMaps = {
        1: [5],
        2: [1, 9],
        3: [1, 5, 9],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 3, 4, 6, 7, 9]
    };

    const activePips = pipMaps[props.value] || [];

    return (
        <button
            style={styles}  
            onClick={props.hold}
            className={`die-face ${props.isHeld ? 'held' : ''}`}
            aria-label={`Die with value ${props.value}, ${props.isHeld ? 'held': 'not held'}`}
        >
            <div className="pip-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(pos => (
                    <span 
                        key={pos} 
                        className={`pip ${activePips.includes(pos) ? 'active' : ''}`}
                    />
                ))}
            </div>
        </button>
    )
}