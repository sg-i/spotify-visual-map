import { useEffect, useState } from 'react';
import './App.css';
import { SimilarityMap } from './components/SimilarityMap';
import { Node, Link } from '../types';
function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadGraphData = async () => {
      const response = await fetch('/graph.json');
      const graph = await response.json();
      setNodes([...graph.nodes]);
      setLinks([...graph.links]);
      setIsLoading(true);
    };

    loadGraphData();
  }, []);

  return (
    <div className="App">
      {isLoading && <SimilarityMap nodes={nodes} links={links} />}
      <div className="App-loading">Loading...</div>
    </div>
  );
}

export default App;
