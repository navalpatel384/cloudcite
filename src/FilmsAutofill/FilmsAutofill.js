import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dropdown, Form, Input, Card, Image, Button } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import CiteForm from '../CiteForm/CiteForm.js';
import { createCitation } from '../functions/createCitation.js';
import './FilmsAutofill.scss';
import Loader from 'react-loaders';
import crypto from 'crypto';
import debounce from 'lodash.debounce';

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

class FilmsAutofill extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filmOptions: [],
            selectedfilm: null,
            filmIdentificationSelected: 'Title',
            startCiting: false,
            citationData: null,
            fieldMap: null,
            creatorsMap: null,
            loaderVisible: false,
            startIndex: 0,
            inputValue: '',
            loaderVisible: false
        };
    }

    componentDidMount() {
        this.fetchFieldAndCreatorsMaps();
    }

    async fetchFieldAndCreatorsMaps() {
        const fieldMap = await fetch(`https://cdn.cloudcite.net/fields/film.json`)
            .then((response) => {
                return response.json();
            });
        const creatorsMap = await fetch(`https://cdn.cloudcite.net/creators/film.json`)
            .then((response) => {
                return response.json();
            });
        this.setState({
            fieldMap: fieldMap,
            creatorsMap: creatorsMap
        });
    }

    getFilmsOptions = debounce(async filmInputValue => {
        this.setState({ 'inputValue': filmInputValue.value, 'loaderVisible': true, 'startIndex': 0 });
        if (this.state.filmOptions.length > 0) {
            this.setState({ "filmOptions": [] });
        }
        if (this.state.filmIdentificationSelected && this.state.filmIdentificationSelected.trim() !== "") {
            try {
                let filmOptions = await fetch('https://api.cloudcite.net/autofillv2', {
                    method: 'POST',
                    body: JSON.stringify({
                        "title": this.state.inputValue,
                        "format": "movie",
                        "page": this.state.startIndex
                    })
                })
                .then((response) => {
                    return response.json();
                });
                this.setState({ "filmOptions": filmOptions.items, 'loaderVisible': false });
            }
            catch (err) {
                if (process.env.NODE_ENV === 'production') {
                    window.ga('send', 'exception', {
                        'exDescription': err.message,
                        'exFatal': false
                    });
                }
                else {
                    console.log(err);
                }
            }
        }
    }, 1000);

    moreFilms = async () => {
        this.setState({ 'startIndex': this.state.startIndex + 20 });
        try {
            let filmOptions = await fetch('https://api.cloudcite.net/autofillv2', {
                method: 'POST',
                body: JSON.stringify({
                    "title": this.state.inputValue,
                    "format": "movie",
                    "page": this.state.startIndex
                })
            })
            .then((response) => {
                return response.json();
            });
            this.setState({ "filmOptions": this.state.filmOptions.concat(filmOptions.items) });
            console.log(this.state.filmOptions.length);
        }
        catch (err) {
            if (process.env.NODE_ENV === 'production') {
                window.ga('send', 'exception', {
                    'exDescription': err.message,
                    'exFatal': false
                });
            }
            else {
                console.log(err);
            }
        }
    }

    async citeFilm(film) {
        try {
            this.setState({ loaderVisible: true });
            let citationData = await fetch('https://api.cloudcite.net/autofillv2', {
                    method: 'POST',
                    headers: {
                        'X-Api-Key': '9kj5EbG1bI4PXlSiFjRKH9Idjr2qf38A2yZPQEZy'
                    },
                    body: JSON.stringify({
                        "format": "movie",
                        "movie": film.id,
                        "transform": true
                    })
                }).then((response) => response.json());
            this.setState({ filmOptions: [], citationData: createCitation(citationData), loaderVisible: false });
        }
        catch (err) {
            this.setState({ citationData: createCitation({ "type": "film" }), loaderVisible: false });
            if (process.env.NODE_ENV === 'production') {
                window.ga('send', 'exception', {
                    'exDescription': err.message,
                    'exFatal': false
                });
            }
            else {
                console.log(err);
            }
        }
    }

    buildForm() {
        if (this.state.citationData && this.state.fieldMap && this.state.fieldMap.length > 0 && this.state.creatorsMap) {
            return (
                <div>
                    <CiteForm citationData={this.state.citationData} fieldMap={this.state.fieldMap} creatorsMap={this.state.creatorsMap} />
                </div>
            );
        }
        else {
            return (
                <Form className="citeForm">
                    <Input
                        icon='search'
                        iconPosition='left'
                        placeholder='Search...'
                        onChange={(e, value) => this.getfilmOptions(value)}
                    />
                </Form>
            );
        }
    }

    render() {
        return (
            <div>
                <div className="top">
                    <h1>Cite a film</h1>
                    <label>You can start citing a film by searching by film title or ISBN and selecting a film.</label>
                </div>
                {this.buildForm()}
                <Loader type="pacman" active={this.state.loaderVisible} color="#005eea" />
                <div id="filmList">
                    {
                        this.state.filmOptions.map((film, index) =>
                            <div className="film-card" key={index}>
                                {film.volumeInfo.imageLinks && film.volumeInfo.imageLinks.thumbnail ? <img className="film-cover" src={film.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')} size="small" /> : <div />}
                                <div className="film-info">
                                    <label className="film-title">{film.volumeInfo.title}</label>
                                    <label className="film-authors">{film.volumeInfo.authors}</label>
                                    {film.volumeInfo.publishedDate ? <label className="film-pd">{film.volumeInfo.publishedDate}</label> : <div />}
                                    <button className="cite-film-btn" onClick={() => this.citeFilm(film)}>Cite</button>
                                </div>
                            </div>
                        )
                    }
                </div>
                <br />
                {(this.state.filmOptions.length > 0) ? <button className="loadMore" onClick={this.moreFilms}>More</button> : ''}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FilmsAutofill));
