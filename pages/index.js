"use client";

import { useEffect, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Head from 'next/head'
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS
import "../styles/Home.module.scss";
import "../styles/colors.module.scss"
import { saveAs } from 'file-saver'

import { Container, InputGroup, FormControl, Button, Row, Card, Image, Col} from 'react-bootstrap'

const CLIENT_ID = "7356b3679e1141f1af514bb1b5431441"
const CLIENT_SECRET = "696d3fb2c7294dc89b4a495cd4181825"

export default function Home() {
  const [imageSrc, setImageSrc] = useState();
  const [uploadData, setUploadData] = useState();
  const [searchInput, setSearchInput] = useState();
  const [accessToken, setAccessToken] = useState();

  const [albums, setAlbums] = useState();

  const [albumImage, setAlbumImage] = useState('h');

  const [albumTitle, setAlbumTitle] = useState();
  const [albumLink, setAlbumLink] = useState();

  const [albumArtist, setAlbumArtist] = useState();
  const [artistLink, setArtistLink] = useState();


  const [albumPicked, setAlbumPicked] = useState(false)
  const [generated, setGenerated] = useState(false)

  const [wallpaperData, setWallpaperData] = useState();

   let imageFile;
   let wallpaperFile

  // Spotify API call
  useEffect(() => {
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }


    fetch("https://accounts.spotify.com/api/token", authParameters)
    .then(result => result.json())
    .then(data => setAccessToken(data.access_token, console.log(data.access_token))
  
    )
  }, [])


  // API Search function

  async function search() {
      console.log("input= " + searchInput) // Display search input

      var searchParameters = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
          }

      }
      var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => { return data.artists.items[0].id })

      console.log("Artist ID: " + artistID);
      var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?/include_groups=album&market=US&limit=50', searchParameters)
      .then(response => response.json())
      .then(data => setAlbums(data.items))}

      console.log(albums)

  /**
   * handleOnChange
   * @description Triggers when the file input changes (ex: when a file is selected)
   */

  async function onSelectAlbum() {
    setAlbumPicked(true)
  }

  function setLoad() {
    const ani = document.createElement('span');
    ani.className = "spinner-border spinner-border-sm p-1"
    ani.role = "status"
    document.getElementById('button').appendChild(ani);
  }

  async function handleOnAlbum(event) {

    var request = new XMLHttpRequest();
    request.open('GET', albumImage, true);
    request.responseType = 'blob';
    request.onload = function() {
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload =  async function(e){
          imageFile = e.target.result;
          setUploadData(undefined);
          console.log('DataURL:', imageFile);
        const fileInput = imageFile;

    console.log('fileInput', fileInput[0]);
    const formData = new FormData();

    for ( const file of fileInput) {
    formData.append('file', albumImage);
    }
    formData.append('upload_preset', 'albumfyUpload');

      const data = await fetch('https://api.cloudinary.com/v1_1/dmgvtj4dc/image/upload', {
    method: 'POST',
    body: formData
    }).then(r => r.json());

    var wallRequest = new XMLHttpRequest();
    wallRequest.open('GET', data.secure_url, true);
    wallRequest.responseType = 'blob';
    wallRequest.onload = function() {
        var wallReader = new FileReader();
        wallReader.readAsDataURL(request.response);
        wallReader.onload =  async function(e){
          wallResult = e.target.result;
          console.log(wallResult);
          setWallpaperData(wallResult);
          
      }
    }

    setImageSrc(data.secure_url);
    console.log(data.secure_url)


    setGenerated(true)
    setUploadData(data);
    

  };
    };
    request.send();

    

}

async function downloadImage() {
  console.log(document.getElementById('wallpaper').src)
  saveAs(document.getElementById('wallpaper').src, 'AlbumfyWallpaper.jpg') // Put your image URL here.
}




  if (!albumPicked) {return (
    <div>
      <Head>
        <title>Generative Fill Model</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='align-items-center mx-auto'>
        <h1 id='title' className='text-center m-5' style={{fontSize: '10vm'}}>
          Generative Fill Model Demo
        </h1>
        <Container style={{width: '100vw'}}>
          <InputGroup style={{width: '75%'}} className='m-auto'>
              <FormControl className=''
                placeholder='Search for an artist'
                type='input'
                onKeyDown={event => {
                  if (event.key == "Enter") {
                    console.log("Enter key pressed");
                    search();
                  }
                }}
                onChange={event => setSearchInput(event.target.value)}
              />
              <Button onClick={search} className='bg-success'>
                Search
              </Button>

          </InputGroup>
        </Container>
        <Container>
          <Row style={{width: '100vw'}} className='mx-2 row row-cols-1 p-2 justify-content-center'>
            {albums?.map( (album, i) => {
              console.log(album);
              return (
                <Card className='m-2 col-lg-3 col-md-4 col-sm-6 col-xs-6' key={'card' + i}  >
              <Card.Img key={'img' + i} src={album.images[0].url}
                />
              <Card.Body key={'body' + i}>
                <Card.Title key={'title' + i}> {album.name} </Card.Title>
              </Card.Body>
              <Button onClick={
                event => { 
                  setAlbumTitle(album.name), 
                  setAlbumArtist(album.artists[0].name), 
                  setArtistLink(album.artists[0].external_urls.spotify)
                  setAlbumImage(album.images[0].url), 
                  setAlbumLink(album.external_urls.spotify),
                  onSelectAlbum()
                }
              }>
                Generate a wallpaper
              </Button>
            </Card>
              )
            })}
          </Row>
        </Container>

      </main>
    </div>
  )
  } else if (!generated) {
  return (
    <div className='display-flex align-items-center'>
        <Container>
          <Row>
            <Col>
              <Card style={{width: '50vw'}} className='mx-auto'>
              <Card.Img id='albumImage' src={albumImage}/>
              <Card.Title className='p-1'>{albumTitle}</Card.Title>
              <Card.Subtitle className='p-1'>{albumArtist}</Card.Subtitle>
              <Button className='p-1' id='button' onClick={ () => {document.getElementById('button').innerText = 'Loading...'; setLoad(); handleOnAlbum(); }}>
                Generate Wallpaper
              </Button>
            </Card>
            </Col>
          </Row>
        </Container>
    </div>
  )
  } else {
  return (
    <div className='display-flex align-items-center'>
        <Container>
          
          <Row className='row row-cols-2'>
            <Col>
              <Card style={{width: '40vw'}}>
              <Card.Img id='albumImage' src={albumImage}/>
              <Card.Title>Original</Card.Title>
            </Card>
            </Col>
            <Col>
              <Card style={{width: '30vw'}}>

                <CldImage id={'wallpaper'} 
                  width={640}
                  height={1137}
                  src={imageSrc}
                  fillBackground
                />
              <Card.Title>
                Wallpaper
              </Card.Title>

                <Button type="button" onClick={() => downloadImage()}>
                Download wallpaper
              </Button> 

            </Card>
            </Col>
          </Row>
        </Container>
    </div>
  )}
  }