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
  
  export default class Import extends Component {
    constructor(props) {
      super(props);
      this.options = countryList().getData();
      this.state = {
        id:'',
        account:'',
        quantity:'',
        exportinglicense:'',
        tocountry:'',
        fromcountry:'',
        checkbox:false,
        billamt:null,
        ipfshash:'',
        options:this.options,
        encdetails:'',
        details:'',
        buffer:'',
        blob:'',
        value: '', watching: false, 
        qrgendone:false,
        ipfsuploaddone:false,
        otherdetopen:false,
        approvebutton:false,
        importinglicense:'',
        bothQRdone:false,
        loading: false,
        coaltracker:null
      };
      
      this.onFind = this.onFind.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.verifybothQRcodes = this.verifybothQRcodes.bind(this);
      this.verifyImport = this.verifyImport.bind(this);
      this.approveImport = this.approveImport.bind(this);
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
        // Time to reload your interface with accounts[0]!
        alert("Account changed");
        this.setState({account:accounts[0]});
      }.bind(this));
  
      //console.log(web3);
      //console.log(accounts);
     // 
     const networkId=await web3.eth.net.getId();
    const networkdata=CoalTracker.networks[networkId];
      if(networkdata)
      {
        const coaltracker=new web3.eth.Contract(CoalTracker.abi,networkdata.address);
        
        this.setState({coaltracker});
        
      }
      
      
    }
  
    onFind (value) {
      //console.log(value);
      
      this.setState({ value, watching: false });
      //alert("Your QR Code is scanned successfully. Verify it now.")
     }
  
     verifybothQRcodes=async(event)=>
     {
      event.preventDefault();
  
     var ipfshash = await this.state.coaltracker.methods.importer(this.state.id.toString()).call({from: this.state.account});
     var ipfslink = "https://ipfs.io/ipfs/" + ipfshash.toString();
      await fetch( ipfslink )
  .then( r => r.arrayBuffer() )
  .then( buffer => { // note this is already an ArrayBuffer
    // there is no buffer.data here
    const data = png.decode(buffer);
      const out = {
        data: new Uint8ClampedArray(png.toRGBA8(data)[0]),
        height: data.height,
        width: data.width,
      };
    //console.log("out=",out);
  
    const code = jsQR(out.data, out.width, out.height);
    //console.log("Found QR code", code.data);
    this.setState({bothQRdone:true});
    this.setState({encdetails:code.data.toString()});
    
  } );
  
  //console.log("value=",this.state.value);
  //console.log("encdetails=",this.state.encdetails);
      if(this.state.encdetails.toString()===this.state.value.toString())
      {
        alert("Your QR code verification is completed successfully. Now, enter the details.");
        //decrypt
        var bytes  = CryptoJS.AES.decrypt(this.state.encdetails.toString(), this.state.id.toString()+"rekcartloac");
        var originalText = bytes.toString(CryptoJS.enc.Utf8);
        this.setState({details:originalText.toString()});
        this.setState({otherdetopen:true});
        //this.state.quantity.focus();
      }
      else
      {
        alert("Your QR code has been tampered or damaged! Please try again.");
      }
    };
      
  
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
  
      async verifyImport()
      {
            //console.log("details=",this.state.details);
            var str= this.state.details.toString();
            var arr=str.split(",");
            var currprodid = arr[0];
            var currquantity = arr[1];
            var currfromc = arr[2];
            var currtoc = arr[3];
            var currexpl = arr[4];
            var curramt = arr[5];
  
            if(this.state.id === currprodid)
            {
              if(this.state.quantity === currquantity)
              {
                  if(this.state.fromcountry === currfromc)
                  {
                    if(this.state.tocountry === currtoc)
                    {
                      if(this.state.exportinglicense === currexpl)
                      {
                          if(this.state.billamt === curramt)
                          {
                            alert("The details have been perfectly verified. You can approve the import.");
                            this.setState({approvebutton:true});
                          }
                          else
                          {
                            alert("The bill amount is not matching. Check for illegal smuggling.");
                            this.billamt.focus();
                          }
                      }
                      else
                      {
                        alert("The Exporting license is not matching. Check for fake exporters.");
                        this.exportinglicense.focus();
                      }
                    }
                    else
                    {
                      alert("The desination country is not matching. Please try again.");
                      
                    }
  
                  }
                  else
                  {
                    alert("The source country is not matching. Please try again.");
                    
                  }
              }
              else
              {
                alert("The quantity received is not matching with the sent quantity. Check for smuggling.");
                this.quantity.focus();
              }
  
            }
            else
            {
              alert("The production lot id is not matching. Get the correct production lot.");
              this.id.focus();
            }
      }
  
      async approveImport()
      {
        await this.setState({loading:true});
        await this.state.coaltracker.methods.verify(this.state.id.toString(),this.state.importinglicense.toString()).send({from:this.state.account, gas: 100000}).then((result)=>{
          console.log("Done");
          this.setState({loading:false});
          alert("Import goods successfully approved for market sale");
        });
      
      }
        
    render() {
   
      return ( 
          
        
        <Segment inverted color = 'blue'>
      <h1> <font color="black">Coal Import Details</font> </h1> 
      <Segment inverted color = "grey" >
      <
      Message attached header = 'Welcome to Coal Import Verification Form!'
      content = 'Fill the details below for verification and checking smuggling'
      icon = "searchengin"
      color = 'black' /
      >
      <Segment>
      <Form>
      <Form.Field >
      <
      Input label = "Production ID"
      fluid ref = {
        (input) => {
          this.id = input;
        }
      }
  
      disabled = {this.state.otherdetopen==true}
      value = {
        this.state.id 
      }
      onChange = {
        event => this.setState({
          id: event.target.value
        })
      }
      /> </Form.Field>
        </Form>
        <h2><b>Verify QR Code via Camera</b></h2>
        <br/><br/>
        {this.state.watching
            ? (
              <QRScan onFind={this.onFind} />
            )
            : (
              <p>
                <Button primary disabled={this.state.id=='' || this.state.bothQRdone==true}onClick={() => this.setState({ watching: true })}>Scan</Button>
              </p>
            )
          }
          
          <br/>
          <br/>
          <Button positive disabled={this.state.id=='' || this.state.bothQRdone==true}onClick={this.verifybothQRcodes}>Verify QR Codes </Button>
              
      </Segment>
  
      <Segment>
      <h2><b>Input the details of imported goods arrived for smuggling verification</b></h2>
      <Form>
      <br/>
  
  
      <Form.Group widths='equal'>
      
  
      <Form.Field>
      <
      Input label = "Quantity(in kg)"
      color = "black"
      fluid ref = {
        (input) => {
          this.quantity = input;
        }
      }
      disabled = {this.state.otherdetopen==false}
      //labelPosition=""
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
          disabled = {this.state.otherdetopen==false}
          onChange={(val) => this.selectCountry2(val)} />
      <br/>
      <div align="left"><h3 color="black">To:</h3><br/></div>
      <CountryDropdown
  
          value={this.state.tocountry}
          disabled = {this.state.otherdetopen==false}
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
      disabled = {this.state.otherdetopen==false}
     
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
      disabled = {this.state.otherdetopen==false}
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
      disabled = {this.state.otherdetopen==false}
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
        this.state.id=='' || this.state.quantity=='' || this.state.tocountry=='' || this.state.fromcountry=='' || this.state.exportinglicense=='' || this.state.billamt=='' ||this.state.checkbox==false || this.state.approvebutton==true
      }
      primary onClick = {
        this.verifyImport
      }
       > Verify Import</Button>
       <br/><br/>
      <Form>
      <Form.Field >
      <
      Input label = "Importing License"
      fluid ref = {
        (input) => {
          this.importinglicense = input;
        }
      }
      disabled = {this.state.approvebutton==false}
     
      value = {
        this.state.importinglicense
      }
      onChange = {
        event => this.setState({
         importinglicense : event.target.value
        })
      }
      /> 
      </Form.Field>
        </Form>
  
  
       <
      Button 
  
      
  
      disabled = {
        this.state.approvebutton==false
      }
      primary onClick = {
        this.approveImport
      }
       > Approve Import</Button>
      <br/>
       <br/>
       <br/>
      </Form>
      </Segment>
      </Segment> 
       </Segment>
        
      );
    }
  }