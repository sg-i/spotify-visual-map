export interface Node {
    id: string;
    x?: number;
    y?: number;
    Track: string;
    'Spotify Streams': number;
}
  
export interface Link {
    source: string | Node;
    target: string | Node;
    value: number;
}