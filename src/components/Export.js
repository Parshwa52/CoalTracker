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
      
      //this.blobtoimage = this.blobtoimage.bind(this);
      
      
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