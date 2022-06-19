import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './JokeList.css';
import Joke from './joke';

class JokeList extends Component {
    static defaultProps = { numJokes: 10 };
    constructor(props) {
        super(props);
        this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), loading: false };
        this.seenJokes = new Set(this.state.jokes.map(joke => joke.text));
        this.handleVote = this.handleVote.bind(this);
        this.getJokes = this.getJokes.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() {
        if (this.state.jokes.length === 0)
            this.setState({ loading: true }, () => { this.getJokes() });
    }
    async getJokes() {
        try {
            let jokes = []
            while (jokes.length < this.props.numJokes) {
                let res = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } });
                let newJoke = res.data.joke
                if (!this.seenJokes.has(newJoke))
                    jokes.push({ text: newJoke, votes: 0, id: uuidv4() });
                else console.log("duplicate");
            }
            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            );
        } catch (err) {
            alert(err);
            this.setState({ loading: false });
        }
    }
    handleClick() {
        this.setState({ loading: true }, () => { this.getJokes() })
    }
    handleVote(id, change) {
        this.setState(st => ({
            jokes: st.jokes.map(joke => (
                joke.id === id ? { ...joke, votes: joke.votes + change } : joke
            ))
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    }
    render() {
        if (this.state.loading)
            return (
                <div className='JokeList-spinner'>
                    <i className='far fa-7x fa-laugh fa-spin' />
                    <h1 className='JokeList-title'>Loading...</h1>
                </div>
            )
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
        return (
            <div className='JokeList'>
                <div className='JokeList-sidebar'>
                    <h1 className='JokeList-title'>
                        <span>Dad</span> Jokes
                    </h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt='joke-emoji' />
                    <button className='JokeList-getmore' onClick={this.handleClick}>Fetch  Jokes</button>
                </div>

                <div className='JokeList-jokes'>
                    {jokes.map(joke => (<Joke key={joke.id} text={joke.text} votes={joke.votes} upVote={() => this.handleVote(joke.id, 1)} downVote={() => this.handleVote(joke.id, -1)} />))}
                </div>
            </div>
        );
    }
}

export default JokeList;