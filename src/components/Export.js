import React, {
    Component
  } from 'react';
  import ReactDOM from 'react-dom';
  import QrScanner from 'qr-scanner'; 
  
  import CoalTracker from '../abis/CoalTracker.json';
  import countryList from 'react-select-country-list';
  import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
  import CryptoJS from 'crypto-js';
  //import QRCode from "react-qr-code";
  import QRCode from 'qrcode.react';
  import Web3 from 'web3';
  import Parse from 'parse';
  import jsQR from "jsqr";
  import QRScan from 'qrscan';
  import png from 'upng-js';

  import {
    Form,
    Modal,
    Header,
    Icon,
    Button,
    Input,
    Dropdown,
    Menu,
    Radio,
    Message,
    Segment,
    Checkbox,
    Confirm,
    Grid,
    Item,
    Container,
    Table,
    Image,
    Step,
    Label
  } from 'semantic-ui-react';
  //import {
    //DateInput
  //} from 'semantic-ui-calendar-react';
  const ipfsClient = require('ipfs-http-client');
  const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'http' }); // leaving out the arguments will default to these values
  const buffer = ipfs.Buffer;
  
  export default class Export extends Component {
    constructor(props) {
      super(props);
      this.options = countryList().getData();
      this.state = {
        id:'',
        account:'',
        quantity:null,
        exportinglicense:'',
        tocountry:'',
        fromcountry:'',
        checkbox:false,
        billamt:null,
        ipfshash:'',
        options:this.options,
        details:'',
        buffer:'',
        blob:'',
        value: '', watching: false, 
        qrgendone:false,
        ipfsuploaddone:false,
        coaltracker:null,
        loading:false
      };
      this.generateQRCode = this.generateQRCode.bind(this);
      //this.blobtoimage = this.blobtoimage.bind(this);
      this.ipfsupload = this.ipfsupload.bind(this);
      
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      
    }

    
  
    async componentDidMount()
    {
      await this.loadWeb3();
      await this.loadBlockchainData();
    }
    async loadWeb3()
    {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          console.log(window.web3);
          //console.log(web3.eth.getAccounts());
          // Acccounts now exposed
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        console.log(window.web3);
        // Acccounts always exposed
      }
      // Non-dapp browsers...
      else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    }
  
    async loadBlockchainData()
    {
      const web3=window.web3;
      const accounts=await web3.eth.getAccounts();
      this.setState({account:accounts[0]});
      window.ethereum.on('accountsChanged', function (accounts) {
        alert("Account changed");
        this.setState({account:accounts[0]});
      }.bind(this));
  
      console.log(web3);
      console.log(accounts);
     const networkId=await web3.eth.net.getId();
      const networkdata=CoalTracker.networks[networkId];
      if(networkdata)
      {
        const coaltracker=new web3.eth.Contract(CoalTracker.abi,networkdata.address);
        console.log(coaltracker);
        this.setState({coaltracker});
      }
      
      
    }
    
    
  
  handleSubmit = async (event) => {
    event.preventDefault();

    try{
      await this.setState({loading:true});
      var id = this.state.id.toString();
      var ipfshash = this.state.ipfshash.toString();
      await this.state.coaltracker.methods.exporter(id,ipfshash).send({from:this.state.account}).then((result)=>{
        console.log("Done");
        this.setState({loading:false});
        alert("The coal has been successfully exported.");
      });
    }
    catch(err)
    {
      console.log(err);
    }
  }

  
  
    
    

    selectCountry =(val)=> {
      this.setState({ tocountry: val });
    }
    selectCountry2 =(val)=> {
      this.setState({ fromcountry: val });
    }
    
    
    
    handleChange = (event, {
      name,
      value
    }) => {
      if (this.state.hasOwnProperty(name)) {
        this.setState({
          [name]: value
        });
      }
    }



    
    generateQRCode = async(event)=> {

      event.preventDefault();
      //console.log(this.state.id + this.state.tocountry + this.state.fromcountry + this.state.exportinglicense+this.state.quantity+this.state.billamt+this.state.checkbox);
      if (!this.state.quantity.match(/^(0|[1-9][0-9]*)$/)) {
        alert("Quantity should be numeric");
        this.quantity.focus()
      }
      else if (!this.state.billamt.match(/^(0|[1-9][0-9]*)$/)) {
        alert("Amount should be numeric");
        this.billamt.focus()
      }
      else
      {
      try {

        
        var alldets = (this.state.id + "," + this.state.quantity + "," + this.state.fromcountry + "," + this.state.tocountry + "," + this.state.exportinglicense + "," + this.state.billamt).toString();
        var details = CryptoJS.AES.encrypt(alldets,this.state.id.toString()+"rekcartloac").toString();
        console.log("ciphertext=",details);
        
        await this.setState({details});
        

      } catch (err) {
        console.log(err);
        
      }

      
        const canvas = await document.getElementById("qrc");
        console.log("canvas=",canvas)
        const pngUrl = await canvas.toDataURL()/*.replace("image/png", "image/octet-stream")*/;
        console.log("pngurl=",pngUrl);
        //let downloadLink = await document.createElement("a");
        
        //downloadLink.href = pngUrl;
        //pngUrl = pngUrl.replace("")
        //downloadLink.download = "qrc.png";
        //document.body.appendChild(downloadLink);
        //console.log("download link",downloadLink)
        /*let uploadobj = {
            imglink:pngUrl,
        };*/
    
        //let objectString = await JSON.stringify(uploadobj);
        //console.log("objstring=",objectString);
        //var base64 = pngUrl.split('base64,')[1];
        //var parseFile = new Parse.File("abcd.png", { base64: base64 });
        

        var byteString = atob(pngUrl.split(',')[1]);

        // separate out the mime component
        var mimeString = pngUrl.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        var ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var blob = await new Blob([ab], {type: mimeString});
        console.log("blob=",blob);
        await this.setState({blob:blob});
        //const imageUrl = URL.createObjectURL(blob); 
        //const myImage = document.getElementById('123');
        //myImage.src = URL.createObjectURL(blob);
        const myFile = await new File([this.state.blob], "image.png", {
          type: this.state.blob.type,
        });
      
        const reader=await new window.FileReader();
            reader.readAsArrayBuffer(myFile);
            // var blob = window.dataURLtoBlob(pngUrl);
             reader.onloadend=()=>{
               //console.log("reader",reader.result);
               this.setState({buffer:Buffer(reader.result)});
               console.log("buffer",this.state.buffer);
               
             }
             this.setState({qrgendone:true});

      }
        

      };

      async ipfsupload()
      {
        //let bufferedString = await Buffer.from(imageUrl.toString());
        await ipfs.add(this.state.buffer,(error,result)=>{
            if(error)
            {
                console.log(error);
                alert("Error in uploading");
            }
            else
            {
              console.log("ipfs hash",result);
              this.setState({ipfshash:result[0].hash});
              alert("Your QR Code has been successfully published on IPFS Decentralised Storage.");
            }
          });
          this.setState({ipfsuploaddone:true});
      }
    
      
    
    
  
    render() {

        
          
        
      return ( 
          
        
        <Segment inverted color = 'blue'>
      <h1> <font color="black">Coal Export Details</font> </h1> 
      <Segment color = "white" >
      <
      Message attached header = 'Welcome to Coal Export Details Form!'
      content = 'Fill out the form below to fill details and export the coal.'
      icon = "searchengin"
      color = 'black' /
      >
      <Form>
      <br/>


      <Form.Group widths='equal'>
      <Form.Field >
      <
      Input label = "Production ID"
      fluid ref = {
        (input) => {
          this.id = input;
        }
      }
      disabled = {this.state.qrgendone==true}
      //  labelPosition=""
      value = {
        this.state.id
      }
      onChange = {
        event => this.setState({
          id: event.target.value
        })
      }
      /> </Form.Field>

      <Form.Field>
      <
      Input label = "Quantity(in kg)"

      fluid ref = {
        (input) => {
          this.quantity = input;
        }
      }
      
      disabled = {this.state.qrgendone==true}
      value = {
        this.state.quantity
      }
      onChange = {
        event => this.setState({
          quantity: event.target.value
        })
      }
      /> 
      </Form.Field>
      
      </Form.Group>
      <br/>
      <div align="left"><h3 color="black">From:</h3><br/></div>
      <CountryDropdown
          value={this.state.fromcountry}
          disabled = {this.state.qrgendone==true}
          onChange={(val) => this.selectCountry2(val)} />
      <br/>
      <div align="left"><h3 color="black">To:</h3><br/></div>
      <CountryDropdown

          value={this.state.tocountry}
          disabled = {this.state.qrgendone==true}
          onChange={(val) => this.selectCountry(val)} /><br/>


          <br/>
          <Form.Group widths='equal'>
      <Form.Field >
      <
      Input label = "Exporting License"
      fluid ref = {
        (input) => {
          this.exportinglicense = input;
        }
      }

      disabled = {this.state.qrgendone==true}
     
      value = {
        this.state.exportinglicense
      }
      onChange = {
        event => this.setState({
         exportinglicense : event.target.value
        })
      }
      /> 
      </Form.Field>
      <Form.Field >
      <
      Input label = "Bill amount"
      fluid ref = {
        (input) => {
          this.billamt = input;
        }
      }

      disabled = {this.state.qrgendone==true}
      value = {
        this.state.billamt
      }
      onChange = {
        event => this.setState({
          billamt: event.target.value
        })
      }
      /> 
      </Form.Field>
      </Form.Group>

      <br/>
      <Form.Field>
      <
      Checkbox label = 'I agree that all the information is correct and properly verified.'
      onChange = {
        event => this.setState({
          checkbox: !(this.state.checkbox)
        })
      }
      /> 
      </Form.Field> 
      <br/>
      <
      Button 
      disabled = {
        this.state.id=='' || this.state.quantity=='' || this.state.tocountry=='' || this.state.fromcountry=='' || this.state.exportinglicense=='' || this.state.billamt=='' ||this.state.checkbox==false || this.state.qrgendone==true
      }
      primary onClick = {
        this.generateQRCode
      }
       > Generate QR Code </Button>
       <br/><br/>

  {this.state.details
  ? 
  (<QRCode
    id="qrc"
    value={this.state.details}
    disabled = {
      this.state.id=='' || this.state.quantity=='' || this.state.tocountry=='' || this.state.fromcountry=='' || this.state.exportinglicense=='' || this.state.billamt==null
    }
    size={290}
    level={"H"}
    includeMargin={true}
    align="center"
  />)
  :
  (
  <p></p>
  )
  }
  
      <br/>
       
      

       <
      Button 
      disabled = {
        this.state.qrgendone ==false || this.state.ipfsuploaddone == true
      }
      primary onClick = {
        this.ipfsupload
      }
       > Publish to IPFS </Button>

       <br/>
       <br/>

       <
      Button positive 

      loading = {this.state.loading}
      disabled = {
        this.state.ipfsuploaddone==false
      }
      primary onClick = {
        this.handleSubmit
      }
       > Export </Button>


      
      </Form>
      
      </Segment> 
       </Segment>
        
      );
    }
  }