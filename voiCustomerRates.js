
<script language=Javascript>
  var ratetip='<%=ratetip%>';
  ratetip=ratetip*1.0;

	var f1=document.forms.form1; f1.action='';
	var fs=document.forms.fSubmit; fs.action=''; 
	var fId = document.getElementById('fSave');
	
	var bShowEdit1= (fs.doretire.value=='yes') ;
    var bShowList1 = ((fs.sIntention.value == 'addnewrate') || (fs.sIntention == 'addgrpsave') );
    var sAllowRSID= '<%if bAllowRSID then%>y<%else%><%end if%>'

	var sToday='<%=displayDate(now,11)%>';
	var sNextday='<%=displayDate(month(now+1)&"/"&day(now+1)&"/"&year(now+1)&" 00:00",11)%>';
	
	var wrn1='Delete this rate entry?';
	var wrn2='Retire this rate entry?';
	var wrn3='Please make following selections first:\nTier, Destination, Dialcode, Vendor, Billing-Increment';
	var wrn4='Please fill in at least the Price field';
	var wrn5='You can add a rate to this Customer only by Cloning\n\nPlease locate a relevant rate and clone it,\nor return to VENDOR view and add a new rate to be cloned';
	var SJJ="";

function showerrSJJ(SJJ)
{
if (SJJ.length >1)
			{
			alert(SJJ);
			SJJ="";
			}
}
	
function switchOption1() {
	     fs.DstPattern.value='';
		 fs.LabelDialCode.value='DialCodes(All)';
 }


function KeepMainFilter()
{

		fs.sX1CustId.value = f1.fX1CustId.options[f1.fX1CustId.selectedIndex].value;
		
		fs.sVoipUserId.value = f1.fvoipUserId.options[f1.fvoipUserId.selectedIndex].value;
		fs.sDestination.value = f1.fDestination.options[f1.fDestination.selectedIndex].value;			
		fs.sDestinationType.value = f1.fDestinationType.options[f1.fDestinationType.selectedIndex].value;				
		fs.sDestinationMobileCarrier.value = f1.fDestinationMobileCarrier.options[f1.fDestinationMobileCarrier.selectedIndex].value;
		fs.sDescription.value = f1.fDescription.options[f1.fDescription.selectedIndex].value;
		fs.sStatusId.value = f1.fStatusId.options[f1.fStatusId.selectedIndex].value;
		fs.spartition.value = f1.mpartition.options[f1.mpartition.selectedIndex].value;
		
		var vendorId = document.getElementById('fAddVendorId');
			
			if (vendorId != null)
			{
		
		fs.sAddVendorId.value = vendorId.options[vendorId.selectedIndex].value;			

			}
				
		
		if (f1.fDestination.options[f1.fDestination.selectedIndex].value == '')
		{	
		 fs.sDestinationType.value = '';
		 fs.sDestinationMobileCarrier.value='';
		}

        fs.sVoipUserName.value = f1.fvoipUserId.options[f1.fvoipUserId.selectedIndex].text;

	 

 return true;
}

	function doSubmit(itn,prm) {
		
		itn = itn.toLowerCase();
		
        
		 KeepMainFilter();

         fs.doretire.value='';
   	     fs.vvdid.value='';		
	   
		if (itn == 'tierselect')
		{

		if(fId!=null)
		{
		return false;
		};

if(prm !='1'){
alert('Please use Tier 1 only');
return false;
};
			fs.sTierId.value = prm;
			fs.sIntention.value = 'view';
		}
		/*if (fs.sTierId.value == '')
		{
			alert("Please Select a Tier!");
			return false;
		}*/
		//fs.DestinationMobileCarrier.value = fs.DestinationMobileCarrier.Selected;
		//alert(itn);
		switch (itn) {
			case 'select':
				fs.sIntention.value = 'select';
			  try{ 	 loadSubmit();	 } catch(e) {};
				fs.submit(); 
				break
            case 'selectx':
                fs.sVoipUserId.value='';
				fs.sVoipUserName.value=''; //bugfelix
                fs.sTierId.value = '';
				fs.sIntention.value = 'selectx';
				  try{ 	 loadSubmit();	 } catch(e) {};
				  		fs.submit(); 
				break
			case 'addnewrate':
			if(fId!=null)
			{
			return false;
			}
             	fs.sIntention.value = 'addnewrate';
					  try{ 	 loadSubmit();	 } catch(e) {};
				fs.submit(); 
				break

			case 'rollback':

             	fs.sIntention.value = itn;
				fs.submit(); 
				break
            
			case 'restore':
             	fs.sIntention.value = itn;
				fs.submit(); 
				break
            case 'transcancel':
	            fs.sIntention.value = itn;
				fs.submit(); 
                break;
			case 'skipallgrp':
		
				n=f1.numrec.value;
				
				xdirty=false;
				
				for(i = 1; i <= n; i++) {
   		          x=CheckDirty(i);
                  xdirty=xdirty||x
	            };
	            
				if (xdirty)
	            {
                 if(!confirm('Warning: you will lost your last changes, marked brown, in browser. Proceed?'))
				 {
                   if(f1.newCustPrice.length != null) {
                     f1.skipgrp[prm-1].checked=!f1.skipgrp[prm-1].checked;
					 }
					 else
					 {
                     f1.skipgrp.checked=!f1.skipgrp.checked;
					 }
				  return false;
			     }
	            }
  
        fs.sIntention.value = itn;
        
		fs.sallgrpCnt.value=n;
		
		SetAllSkipGroupFlags();

		
		fs.sKeepTempTable.value='y';

        fs.CheckNewPrice2copy.value=	f1.CheckNewPrice2copy.options[f1.CheckNewPrice2copy.selectedIndex].value;
		fs.newCustPrice2copy.value=f1.newCustPrice2copy.value; 
		fs.newBi2copy.value=f1.newBi2copy.value;
		fs.newRetireDt2copy.value=f1.newRetireDt2copy.value;
		fs.newEffectDt2copy.value=f1.newEffectDt2copy.value;
	  try{ 	 loadSubmit();	 } catch(e) {};
				fs.submit(); 
			
			     return false;

			case 'skipgrp':
			    ValidateGroup(prm,'');
			    return false;
				
                
			default:
				  try{ 	 loadSubmit();	 } catch(e) {};
				fs.submit();
				break	
		}
	}


function doSubmit1(itn,prm) {

 KeepMainFilter();

switch (itn)
{
case 'lastdrop':
n=fs.numsgrp.value;
bb=false;
fs.lastdroplist.value='';
for(i = 1; i <= n; i++) {
//alert(i);
b=eval('f1.grplastdrop'+i+'.checked'); 
//alert(b);
bb=bb||b;

if(b) {

p=eval('f1.grplastdrop'+i+'.value;');
p=p+','+eval('f1.grpretirementdata'+i+'.value;');
//p=p+'|'+eval('f1.grpmaxefd'+i+'.value;');
fs.lastdroplist.value=fs.lastdroplist.value+"@"+p;
//alert(p);

};

};
if(!bb) {
alert('nothing to do');
return false;
};

 fs.sIntention.value= 'lastdrop';
 	  try{ 	 loadSubmit();	 } catch(e) {};
 fs.submit();
return false;
break;
case 'groupload_add':
n=fs.numsgrp.value;
//alert(n);
fs.vvdidlist.value='0';

bb=false;
for(i = 1; i <= n; i++) {
//alert(i);
b=eval('f1.grpretirement'+i+'.checked'); 
//alert(b);
bb=bb||b;

if(b) {

p=eval('f1.grpretirementdata'+i+'.value;');
//alert(p);
//alert(eval('f1.grpretirementdata'+i+'.value;'));
// fs.grpretirementdata[i-1].value= p;
fs.vvdidlist.value=fs.vvdidlist.value+','+eval('f1.grpretirementvendor'+i+'.value;')

};

};


//alert(fs.vvdidlist.value);
//return false;
if(fId != null)
{
return false;
};

   var a = p.split('|')

	  fs.sIntention.value= 'retiresupergrp';
      fs.min1Value.value=a[0];
      fs.min2Value.value=a[1];
      fs.vvdid.value=a[2];
      fs.orgdest.value=a[3];
      fs.orgtype.value=a[4];
      fs.doretire.value='yes';
	  		  try{ 	 loadSubmit();	 } catch(e) {};
	  fs.submit();
      break;


return false;

case 'load_add':

if(fId != null)
{
return false;
};

   var a = prm.split('|')

	  fs.sIntention.value= 'retiregrp';
      fs.min1Value.value=a[0];
      fs.min2Value.value=a[1];
      fs.vvdid.value=a[2];
      fs.orgdest.value=a[3];
      fs.orgtype.value=a[4];
      fs.doretire.value='yes';
	  	
	  fs.submit();
      break;

case 'submit':

n=fs.numsgrp.value;
fs.vvdidlist.value='0';
for(i = 1; i <= n; i++) {
p=eval('f1.grpretirementdata'+i+'.value;');
//alert(eval('f1.grpretirementdata'+i+'.value;'));
//alert(fs.grpretirementdata[0].value);
try{
fs.grpretirementdata[i-1].value= p;
}
catch (e)
{fs.grpretirementdata.value= p;}

fs.vvdidlist.value=fs.vvdidlist.value+','+eval('f1.grpretirementvendor'+i+'.value;')

};

      fs.vrcRetireDt.value=f1.vrcRetireDt.value;
      fs.sIntention.value= 'doretiresupergrp';
      fs.doretire.value='';
	  	  try{ 	 loadSubmit();	 } catch(e) {};
      fs.submit();
      break;
case 'cancel':
      fs.vvdid.value='';
      fs.doretire.value='';
      fs.sIntention.value= 'cancel';
	  try{ 	 loadSubmit();	 } catch(e) {};
	  fs.submit();
      break;

}

}

function isDateM(p_Expression){
	return !isNaN(new Date(p_Expression));		// <<--- this needs checking
}

function dateAdd(p_Interval, p_Number, p_Date){
	if(!isDateM(p_Date)){return "invalid date: '" + p_Date + "'";}
	if(isNaN(p_Number)){return "invalid number: '" + p_Number + "'";}	

	p_Number = new Number(p_Number);
	var dt = new Date(p_Date);
	switch(p_Interval.toLowerCase()){
		case "yyyy": {// year
			dt.setFullYear(dt.getFullYear() + p_Number);
			break;
		}
		case "q": {		// quarter
			dt.setMonth(dt.getMonth() + (p_Number*3));
			break;
		}
		case "m": {		// month
			dt.setMonth(dt.getMonth() + p_Number);
			break;
		}
		case "y":		// day of year
		case "d":		// day
		case "w": {		// weekday
			dt.setDate(dt.getDate() + p_Number);
			break;
		}
		case "ww": {	// week of year
			dt.setDate(dt.getDate() + (p_Number*7));
			break;
		}
		case "h": {		// hour
			dt.setHours(dt.getHours() + p_Number);
			break;
		}
		case "n": {		// minute
			dt.setMinutes(dt.getMinutes() + p_Number);
			break;
		}
		case "s": {		// second
			dt.setSeconds(dt.getSeconds() + p_Number);
			break;
		}
		case "ms": {		// second
			dt.setMilliseconds(dt.getMilliseconds() + p_Number);
			break;
		}
		default: {
			return "invalid interval: '" + p_Interval + "'";
		}
	}
	return dt;
}

 function CheckDirty(grpCnt) {
  var xerr,xcol,s;
 xerr=false;


 if(f1.newCustPrice.length != null) {

					if (f1.cex[grpCnt-1].value!='')
					{
					 return false;

					};

					if (f1.skipgrp[grpCnt-1].checked)
					{
			
					  return false;

					};


                    nprice=f1.newCustPrice[grpCnt-1].value;
					nprice1=f1.newCustPriceSave[grpCnt-1].value;
					nvbsid=f1.newvbsId[grpCnt-1].value;       
                    nvbsid1=f1.newvbsIdSave[grpCnt-1].value;  

					nrsid=f1.newrsId[grpCnt-1].value;       
                    nrsid1=f1.newrsIdSave[grpCnt-1].value;  
					newrsIdColor=f1.newrsIdColor[grpCnt-1].value; 

				    nefdt=f1.newGrpEffectDt[grpCnt-1].value;
                    nefdt1=f1.newGrpEffectDtSave[grpCnt-1].value;
                    nrtdt=f1.newGrpRetireDt[grpCnt-1].value;
                    nrtdt1=f1.newGrpRetireDtSave[grpCnt-1].value;
                    nvbsidtext1=f1.newvbsIdTextSave[grpCnt-1].value;       
                 
					}
					else
					{

  				   if (f1.cex.value!='')
					{
					 return false;

					};

					if (f1.skipgrp.checked)
					{
			
					  return false;

					};


                    nprice=f1.newCustPrice.value;
					nprice1=f1.newCustPriceSave.value;
				    nvbsid=f1.newvbsId.value;       
                    nvbsid1=f1.newvbsIdSave.value;    
					
					nrsid=f1.newrsId.value;       
                    nrsid1=f1.newrsIdSave.value;  
                    newrsIdColor=f1.newrsIdColor.value; 
				
				    nefdt=f1.newGrpEffectDt.value;
                    nefdt1=f1.newGrpEffectDtSave.value;
                    nrtdt=f1.newGrpRetireDt.value;
                    nrtdt1=f1.newGrpRetireDtSave.value;
                    nvbsidtext1=f1.newvbsIdTextSave.value;       
                  
					};

					
					xerr1=((1*nprice)!=(1*nprice1));
                    xerr=xerr||xerr1;  
					if (xerr1)
                        {
						   xcol='#eedede';
				   		   s='Current value was changed from previous - price ' + nprice1 + ' - but is not applied to the codes';
                        }
						else
						{
                            xcol='white';
							s='';
						};

 if(f1.newCustPrice.length != null) {

                       f1.newCustPrice[grpCnt-1].style.backgroundColor = xcol;
                       f1.newCustPrice[grpCnt-1].title=s;
}else
{
                       f1.newCustPrice.style.backgroundColor = xcol;
                       f1.newCustPrice.title=s;

};

	                xerr1=(nvbsid!=nvbsid1);
                    xerr=xerr||xerr1;  
					if (xerr1)
                        {
                           xcol='#eedede';
						   s1='Current value was changed from previous - bi ' + nvbsidtext1 + ' - but is not applied to the codes';
               
                        }
						else
						{
                            xcol='white';
							s1='';
						};

if ((s!='')&&(s1!=''))
{
s='Current values were changed from previous - price ' + nprice1 + ' bi ' + nvbsidtext1 + ' - but were not applied to the codes';
}
else
{
if(s!='')
{
xcol='#eedede';
};
if (s1!='')
{
s=s1;
}
};

 if(f1.newCustPrice.length != null) {

                       f1.newCustPrice[grpCnt-1].style.backgroundColor = xcol;
                       f1.newCustPrice[grpCnt-1].title=s;
					   if (s1!='')
					   {
					   f1.newvbsId[grpCnt-1].style.backgroundColor = xcol;
					   }

}else
{
                       f1.newCustPrice.style.backgroundColor = xcol;
                       f1.newCustPrice.title=s;
					   if (s1!='')
					   {
					   f1.newvbsId.style.backgroundColor = xcol;
					   }

};


/*
 if(f1.newCustPrice.length != null) {

                       f1.newvbsId[grpCnt-1].style.backgroundColor = xcol;
					   f1.newvbsId[grpCnt-1].title=s;
}else
{
                       f1.newvbsId.style.backgroundColor = xcol;
                       f1.newvbsId.title=s;

};

*/


                    xerr1=(nefdt!=nefdt1);
                    xerr=xerr||xerr1;  
                    if (xerr1)
                        {
                           xcol='#eedede';
						   s='Current value was changed from previous ' + nefdt1 + ' but is not applied to the codes';
                        }
						else
						{
                            xcol='white';
							s='';
						};

 if(f1.newCustPrice.length != null) {

                       f1.newGrpEffectDt[grpCnt-1].style.backgroundColor = xcol;
                       f1.newGrpEffectDt[grpCnt-1].title=s;
}else
{
                       f1.newGrpEffectDt.style.backgroundColor = xcol;
                       f1.newGrpEffectDt.title=s;

};
				

                    xerr1=(nrtdt!=nrtdt1);
                    xerr=xerr||xerr1;  
                    if (xerr1)
                        {
                           xcol='#eedede';
						   s='Current value was changed from previous ' + nrtdt1 + ' but is not applied to the codes';
                        }
						else
						{
                            xcol='white';
							s='';
						};

 if(f1.newCustPrice.length != null) {

                       f1.newGrpRetireDt[grpCnt-1].style.backgroundColor = xcol;
                       f1.newGrpRetireDt[grpCnt-1].title=s;
}else
{
                       f1.newGrpRetireDt.style.backgroundColor = xcol;
                       f1.newGrpRetireDt.title=s;

};

if(sAllowRSID!='')
	{
	
                    xerr1=(nrsid!=nrsid1);
                    xerr=xerr||xerr1;  
                    if (xerr1)
                        {
					       xcol='#eedede';
						   s='Current value was changed from previous ' + nrsid1 + ' but is not applied to the codes';
                        }
						else
						{
                            xcol=newrsIdColor; //'white';
							s='';
						};

 if(f1.newCustPrice.length != null) {

                       f1.newrsId[grpCnt-1].style.backgroundColor = xcol;
                       f1.newrsId[grpCnt-1].title=s;
					  // f1.newGrpRetireDt[grpCnt-1].style.backgroundColor = xcol;
                      
}else
{
                       f1.newrsId.style.backgroundColor = xcol;
                       f1.newrsId.title=s;

};
				
                   
   };                   
 
 return xerr;

 };


 var nprice, nvbsid, nefdt, nrtdt, nrsid; // must be common!
 var actcount;

 function SetSkipGroupFlag(grpCnt) {

 if(f1.newCustPrice.length != null) {

					if (f1.cex[grpCnt-1].value!='')
					{
 					 fs.skipgrp[grpCnt-1].value= 'y';
					 return false;

					};

					if (f1.skipgrp[grpCnt-1].checked)
					{
			
					 fs.skipgrp[grpCnt-1].value= 'y';
                      return false;

					};

					fs.skipgrp[grpCnt-1].value='';

  } else

  {
					if (f1.cex.value!='')
					{
					 fs.skipgrp.value= 'y';
					 return false;

					};

					if (f1.skipgrp.checked)
					{
			
 					 fs.skipgrp.value= 'y';
                      return false;
                     };
 					 
					 fs.skipgrp.value='';

 };

 return true;

 }

function SetAllSkipGroupFlags() {
var n,i,xerr,xerr1;

n=fs.numgrp.value;

if (n=='0')
{
 return false;
};

xerr=false;

for(i = 1; i <= n; i++) {
xerr1=SetSkipGroupFlag(i);
xerr=xerr||xerr1;
};

return xerr;

}

function roundNumber(rnum) {
	var rlength = 4; // The number of decimal places to round to
	if (rnum > 8191 && rnum < 10485) {
		rnum = rnum-5000;
		var newnumber = Math.round(rnum*Math.pow(10,rlength))/Math.pow(10,rlength);
		newnumber = newnumber+5000;
	} else {
		var newnumber = Math.round(rnum*Math.pow(10,rlength))/Math.pow(10,rlength);
	}
	return  newnumber;
}

 function ValidateGroup(grpCnt,alerts) {
 // var nprice, nvbsid, nefdt, nrtdt; // must be common!
  var xerr1,xerr2,xerr20, xerr3,min1,max1,s,xcol,xwarn;
	var	mytime="<%=session("mytime")%>";
  var balert = (alerts != '');

             xerr1=false;
             xerr2=false;
             xerr20=false;
             xerr3=false;
			
			 xwarn=false;

if(f1.newCustPrice.length != null) {

					if (f1.cex[grpCnt-1].value!='')
					{
                   //  fs.newCustPrice[grpCnt-1].value= f1.newCustPrice[grpCnt-1].value;
					 fs.skipgrp[grpCnt-1].value= 'y';
					 return false;

					};

					if (f1.skipgrp[grpCnt-1].checked)
					{
			
				//	  fs.newCustPrice[grpCnt-1].value= '0'; // nprice;   //                     
				        fs.newCustPrice[grpCnt-1].value=f1.newCustPrice[grpCnt-1].value;
                        fs.newvbsId[grpCnt-1].value=f1.newvbsId[grpCnt-1].value; 
                        fs.newGrpEffectDt[grpCnt-1].value=f1.newGrpEffectDt[grpCnt-1].value;
                        fs.newGrpRetireDt[grpCnt-1].value=f1.newGrpRetireDt[grpCnt-1].value;
						
						fs.newCustPriceSave[grpCnt-1].value=f1.newCustPriceSave[grpCnt-1].value;
                        fs.newvbsIdSave[grpCnt-1].value=f1.newvbsIdSave[grpCnt-1].value; 
                        fs.newvbsIdTextSave[grpCnt-1].value=f1.newvbsIdTextSave[grpCnt-1].value; 

                        fs.newGrpEffectDtSave[grpCnt-1].value=f1.newGrpEffectDtSave[grpCnt-1].value;
                        fs.newGrpRetireDtSave[grpCnt-1].value=f1.newGrpRetireDtSave[grpCnt-1].value;
						
					    fs.newrsId[grpCnt-1].value=f1.newrsId[grpCnt-1].value; 
                        fs.newrsIdSave[grpCnt-1].value=f1.newrsIdSave[grpCnt-1].value; 
                        fs.newrsIdColor[grpCnt-1].value=f1.newrsIdColor[grpCnt-1].value; 
                     
						fs.grpindex[grpCnt-1].value=f1.grpindex[grpCnt-1].value;
						document.getElementById('idnp'+grpCnt).options.length=0;
						document.getElementById('idnp'+grpCnt).options[0]=new Option("SKIPPED", "0");           
						
 					    fs.skipgrp[grpCnt-1].value= 'y';

                        document.getElementById('rid'+grpCnt).style.backgroundColor='#b3c7d2';
                          
                        return false;

					};
                    
					document.getElementById('rid'+grpCnt).style.backgroundColor='';
                      
                    fs.skipgrp[grpCnt-1].value ='';

                    nprice=f1.newCustPrice[grpCnt-1].value;
	                
                    s='';

                    if (isNaN(nprice)) {
	                        s = 'Line ' + grpCnt + ': New Cust. Price Rate Must A Number!';
                            if (balert) {  alert(s); }

						    xerr1=true;
	                    }
					
					// 	if ( (!xerr1)&&((1*nprice <= ( 1*(f1.gvcost[grpCnt-1].value) - ratetip)) &&(ratetip!=0)) ) {
                 
				 //  if ((!xerr1)&&(1*nprice <= ( 1*(f1.gvcost[grpCnt-1].value) - ratetip))) {
              ////    if ((!xerr1)&&(1.0*nprice <= 1.0*f1.gvcost[grpCnt-1].value)) {
                	  if (1 <= 0) {
                			s = 'Line ' + grpCnt + ': New Cust. Rate Must > $' + f1.gvcost[grpCnt-1].value + ' - $'+ratetip+' - Supplier Rate!';
                      	 
	                   if (balert) {  alert(s); }

						    xerr1=true;
	                    }
					
                        if (xerr1)
                        {
                           xcol='#FA8072';
                        }
						else
						{
	                       xcol='white';
						};

                       f1.newCustPrice[grpCnt-1].style.backgroundColor = xcol;
                       f1.newCustPrice[grpCnt-1].title=s;
						
					   if ((!xerr1)&&( (1*nprice) > (roundNumber(0.02 + 1*(f1.gvcost[grpCnt-1].value)) ))) {
                            
							s = 'Warning: New Cust.Rate ' + nprice + ' Is 2 cents more then Vendor Cost ' + f1.gvcost[grpCnt-1].value;
                           	
							v=document.getElementById('idnp'+grpCnt).value;
							l=document.getElementById('idnp'+grpCnt).options.length;

                            if (v=='0')
							{
                              if (balert) {  alert(s); };
							  xerr1=true;
							  xwarn=true;
							};
                            
					
                            document.getElementById('idnp'+grpCnt).options.length=0;
                            document.getElementById('idnp'+grpCnt).options[0]=new Option("Deny", "0");           
                 			document.getElementById('idnp'+grpCnt).options[1]=new Option("Allow", "1");

                            k=fs.nnnp[grpCnt-1].value;
                
							if (((v=='1')&&(l==2))||((k=='1')&&(l==0)))
                    	    {
							k=1;
                            document.getElementById('idnp'+grpCnt).options.selectedIndex = k; 

                            }
							else
							{
							k=0;
                            document.getElementById('idnp'+grpCnt).options.selectedIndex = k; 
							xerr1=true;  
							};


  						    document.getElementById('idtdnp'+grpCnt).title=s;

                            
                            fs.nnnp[grpCnt-1].value = k; 

						   }
						else
						{
						
						    document.getElementById('idnp'+grpCnt).options.length=0;
							if (xerr1)
							{
							document.getElementById('idnp'+grpCnt).options[0]=new Option("ER", "0");           
							}
							else
							{
                            document.getElementById('idnp'+grpCnt).options[0]=new Option("OK", "1");           
							};

						    fs.nnnp[grpCnt-1].value = ''; 

                        };


						if (xerr1)
						    {
							 //s='Error';
							 xcol='#FA8072';
						    }
							else
							{
						    s='OK'; 
							xcol='lightgreen';
							};

                        	document.getElementById('idnp'+grpCnt).style.backgroundColor=xcol;
                            document.getElementById('idtdnp'+grpCnt).title=s;

					
					 
					   s='';  

                       nvbsid=f1.newvbsId[grpCnt-1].value;       
                       if (nvbsid=='0') {
	                        s = 'Line ' + grpCnt + ': New Billing Increment Must Be Selected!';

	                        if (balert) {  alert(s); }

							xerr3=true;
	                    }
					
                       if (xerr3)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						}

                    	f1.newvbsId[grpCnt-1].style.backgroundColor = xcol;
                        f1.newvbsId[grpCnt-1].title=s;

                        nrsid=f1.newrsId[grpCnt-1].value;

                      // if (nrsid=='0') {
	                  //      s = 'Line ' + grpCnt + ': New RSID Must Be Selected!';

	                   //     if (balert) {  alert(s); }

						//	xerr3a=true;
	                  //  }
					
                   //    if (xerr3a)
                   //     {
                   //        xcol='#FA8072';
                    //    }
					//	else
					//	{
                     //       xcol='white';
					//	}

                    	//f1.newrsId[grpCnt-1].style.backgroundColor = xcol;
                        //f1.newrsId[grpCnt-1].title=s;


						s='';
                  
                        min1=f1.maxcustefdt[grpCnt-1].value;                   
					    
						s1='Cust';
				        if (min1=='--none--')
						{
                          min1=f1.maxvendefdt[grpCnt-1].value;                   
					      s1='Vend';
						}

						if (min1.indexOf('.') > -1)
                              {
                                      min1=min1.replace('.', ' ');

                              };

					   nefdt=f1.newGrpEffectDt[grpCnt-1].value;
					 
					

                       if (nefdt!='--tonight--')
                       {
					   if (nefdt.indexOf('.') > -1)
                              {
                                      nefdt=nefdt.replace('.',' ');

                               };

                       if (!isDateM(nefdt)) {
	                        s = 'Line ' + grpCnt + ': New Effect Date is Wrong!';
                            if (balert) {  alert(s); }
	                        xerr20=true;
	                    }
						else
						{
						 min1=dateAdd('s',1,min1);
						//------------check bill incre date------------------
						if ((f1.maxPrice[grpCnt-1].value !=f1.gvcost[grpCnt-1].value) && (f1.maxPrice[grpCnt-1].value !=null))
							{
								if (f1.newCustPrice[grpCnt-1].value - f1.maxPrice[grpCnt-1].value > 0.0)
								{
										//alert(f1.maxPrice[grpCnt-1].value+':'+f1.newCustPrice[grpCnt-1].value);
									if ((new Date(nefdt)) <= (new Date(mytime.replace(".",""))))
									{
									nefdt=mytime;
									f1.newGrpEffectDt[grpCnt-1].value=mytime;
									SJJ="Some of the effective date were extended to "+mytime+" due to the rate increment periods.";
									
									}
								}
							}
							
					//-------------end-------------------------------
						
					
						  if ( (new Date(nefdt)) <= (new Date(min1)) )
				            {
                                s= 'Wrong Effect Date : less then Max '+s1+' Effect Date';
							    if (balert) {  alert(s); }
	                       		xerr20=true;
				            }
						}
                        } 

                        if (xerr20)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						}

                        f1.newGrpEffectDt[grpCnt-1].style.backgroundColor = xcol;

                        f1.newGrpEffectDt[grpCnt-1].title=s;

                         s='';

                        //f1.newGrpRetireDt[grpCnt-1].style.backgroundColor = xcol;

						max1=f1.maxvendrtdt[grpCnt-1].value;

						if (max1.indexOf('.') > -1)
                              {
                                      max1=max1.replace('.', ' ');

                              };


                       nrtdt=f1.newGrpRetireDt[grpCnt-1].value;
                       if (nrtdt!='--never--'&&nrtdt!='')
                       {
   					   if (nrtdt.indexOf('.') > -1)
                             {
                                      nrtdt=nrtdt.replace('.', ' ');

                               };

 
                  if (!isDateM(nrtdt)) {
	                        s = 'Line ' + grpCnt + ': New Retire Date is Wrong!';
							if (balert) {  alert(s); }
	                       	xerr2=true;
	                    }
						else
						{
                          
						  if (isDateM(nefdt))
						  {
						  min1=dateAdd('s',1,nefdt);
					
						  if ( (new Date(nrtdt)) <= (new Date(min1)) )
				            {
                                s='Wrong New Retire Date : less then New Effect Date'; 
								if (balert) {  alert(s); }
	                       		xerr2=true;
				            }
                          };

                          if (isDateM(max1))
						  {
						  //min1=dateAdd('s',1,nefdt);
					
						  if ( (new Date(max1)) <= (new Date(nrtdt)) )
				            {
                                s='Wrong New Retire Date : more then Max Vendor Retire Date'; 
                                if (balert) {  alert(s); }
	                       		
								xerr2=true;
				            }
                          };

						}
						}
                       
                        if (xerr2)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						}


                        f1.newGrpRetireDt[grpCnt-1].style.backgroundColor = xcol;
                        f1.newGrpRetireDt[grpCnt-1].title=s;
                       
						fs.newCustPrice[grpCnt-1].value=f1.newCustPrice[grpCnt-1].value;
                        fs.newvbsId[grpCnt-1].value=f1.newvbsId[grpCnt-1].value; 
                        fs.newGrpEffectDt[grpCnt-1].value=f1.newGrpEffectDt[grpCnt-1].value;
                        fs.newGrpRetireDt[grpCnt-1].value=f1.newGrpRetireDt[grpCnt-1].value;
						fs.newCustPriceSave[grpCnt-1].value=f1.newCustPriceSave[grpCnt-1].value;
                        fs.newvbsIdSave[grpCnt-1].value=f1.newvbsIdSave[grpCnt-1].value; 
						fs.newvbsIdTextSave[grpCnt-1].value=f1.newvbsIdTextSave[grpCnt-1].value; 

                        fs.newGrpEffectDtSave[grpCnt-1].value=f1.newGrpEffectDtSave[grpCnt-1].value;
                        fs.newGrpRetireDtSave[grpCnt-1].value=f1.newGrpRetireDtSave[grpCnt-1].value;

						fs.newrsId[grpCnt-1].value=f1.newrsId[grpCnt-1].value; 
                    	fs.newrsIdSave[grpCnt-1].value=f1.newrsIdSave[grpCnt-1].value; 
                        fs.newrsIdColor[grpCnt-1].value=f1.newrsIdColor[grpCnt-1].value; 
                     
						fs.grpindex[grpCnt-1].value=f1.grpindex[grpCnt-1].value;
						
						}


						else // if(f1.newCustPrice.length != null) 
						{

					if (f1.cex.value!='')
					{

				    //fs.newCustPrice.value= '0'; // nprice;   //                     
					fs.skipgrp.value= 'y';

                     return false;

					}

					if (f1.skipgrp.checked)
					{

//					  fs.newCustPrice.value= '0'; // nprice;   //        

				        fs.newCustPrice.value= f1.newCustPrice.value;
					    fs.newvbsId.value=f1.newvbsId.value; 
                        fs.newGrpEffectDt.value=f1.newGrpEffectDt.value;
                        fs.newGrpRetireDt.value=f1.newGrpRetireDt.value;
						fs.newCustPriceSave.value=f1.newCustPriceSave.value;
                        fs.newvbsIdSave.value=f1.newvbsIdSave.value; 
						fs.newvbsIdTextSave.value=f1.newvbsIdTextSave.value; 
                        fs.newGrpEffectDtSave.value=f1.newGrpEffectDtSave.value;
                        fs.newGrpRetireDtSave.value=f1.newGrpRetireDtSave.value;
						
					    fs.newrsId.value=f1.newrsId.value; 
					    fs.newrsIdSave.value=f1.newrsIdSave.value; 
                        fs.newrsIdColor.value=f1.newrsIdColor.value; 
                     
						fs.grpindex.value=f1.grpindex.value;
						document.getElementById('idnp'+grpCnt).options.length=0;
						document.getElementById('idnp'+grpCnt).options[0]=new Option("SKIPPED", "0");           
						
   					    fs.skipgrp.value= 'y';

                        document.getElementById('rid'+grpCnt).style.backgroundColor='#b3c7d2';
                       
                      return false;

					};

                         document.getElementById('rid'+grpCnt).style.backgroundColor='';
                       
						 fs.skipgrp.value ='';

                         nprice=f1.newCustPrice.value;
	   

                          if (isNaN(nprice)) {
	                        s = 'Line ' + grpCnt + ': New Cust. Price Rate Must A Number!';
                            if (balert) {  alert(s); }

						    xerr1=true;
	                    }
					//	 	if ( (!xerr1)&&((1*nprice <= ( 1*(f1.gvcost.value) - ratetip)) &&(ratetip!=0)) ) {
               
				// if ((!xerr1)&&(1*nprice <= ( 1*(f1.gvcost.value) - ratetip))) {
				// if ((!xerr1)&&(1.0*nprice <= 1.0*f1.gvcost.value)) {
				  if (1 <= 0) {
                            s = 'Line ' + grpCnt + ': New Cust. Rate Must > $' + f1.gvcost.value + ' - $'+ratetip+' - Supplier Rate!';
                      	 
	                   if (balert) {  alert(s); }

						    xerr1=true;
	                    }
					
                        if (xerr1)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						};

                       f1.newCustPrice.style.backgroundColor = xcol;
                       f1.newCustPrice.title = s;

                     if ((!xerr1)&&( (1*nprice) > (roundNumber(0.02 + 1*(f1.gvcost.value)) ))) {
                            s = 'Warning: New Cust.Rate ' + nprice + ' Is 2 cents more then Vendor Cost ' + f1.gvcost.value;
                           	
							v=document.getElementById('idnp'+grpCnt).value;
							l=document.getElementById('idnp'+grpCnt).options.length;

                            if (v=='0')
							{
                              if (balert) {  alert(s); };
							  xerr1=true;
							  xwarn=true;
							};
                            
							//document.getElementById('idnp'+grpCnt).style.backgroundColor='yellow';
                            //document.getElementById('idnp'+grpCnt).title=s;
                            document.getElementById('idnp'+grpCnt).options.length=0;
                            document.getElementById('idnp'+grpCnt).options[0]=new Option("Deny", "0");           
                 			document.getElementById('idnp'+grpCnt).options[1]=new Option("Allow", "1");
     
                           
							k=fs.nnnp.value;
                
							if (((v=='1')&&(l==2))||((k=='1')&&(l==0)))
                    	    {
							k=1;
                            document.getElementById('idnp'+grpCnt).options.selectedIndex = k; 

                            }
							else
							{
							k=0;
                            document.getElementById('idnp'+grpCnt).options.selectedIndex = k; 
							xerr1=true;  
							};


  						    document.getElementById('idtdnp'+grpCnt).title=s;

                            
                            fs.nnnp.value = k; 
              	   
				   /*
							if ((v=='1')&&(l==2))
                    	    {
                              document.getElementById('idnp'+grpCnt).options.selectedIndex = 1; 
  						    }
							else
							{
							document.getElementById('idnp'+grpCnt).options.selectedIndex = 0; 
							xerr1=true;
							};

  						    document.getElementById('idtdnp'+grpCnt).title=s;

*/
							//document.getElementById('idnp'+grpCnt).style.backgroundColor='yellow';
                            //document.getElementById('idnp'+grpCnt).title=s;

						   }
						else
						{
						    document.getElementById('idnp'+grpCnt).options.length=0;
							if (xerr1)
							{
							document.getElementById('idnp'+grpCnt).options[0]=new Option("ER", "0");           
							}
							else
							{
                            document.getElementById('idnp'+grpCnt).options[0]=new Option("OK", "1");           
							};
                        };

						if (xerr1)
						    {
							 //s='Error';
							 xcol='#FA8072';
						    }
							else
							{
						    s='OK'; 
							xcol='lightgreen';
							};

                        	document.getElementById('idnp'+grpCnt).style.backgroundColor=xcol;
                            document.getElementById('idtdnp'+grpCnt).title=s;

					 
					   s='';

                       nvbsid=f1.newvbsId.value;       
                       if (nvbsid=='0') {
	                        s = 'Line ' + grpCnt + ': New Billing Increment Must Be Selected!';

	                        if (balert) {  alert(s); }

							xerr3=true;
	                    }
					
                       if (xerr3)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						}

                    	f1.newvbsId.style.backgroundColor = xcol;
						f1.newvbsId.title = s;

						
					   nrsid=f1.newrsId.value;

                     //  if (nrsid=='0') {
	                 //       s = 'Line ' + grpCnt + ': New RSID Must Be Selected!';

	                 //       if (balert) {  alert(s); }

					//		xerr3a=true;
	                //    }
					
                  //     if (xerr3a)
                  //      {
                  //         xcol='#FA8072';
                  //      }
				//		else
				//		{
                  //          xcol='white';
					//	}

                    	//f1.newrsId.style.backgroundColor = xcol;
                        //f1.newrsId.title=s;


						s=''; 
                        min1=f1.maxcustefdt.value;                   
   					    s1='Cust';
				        if (min1=='--none--')
						{
                          min1=f1.maxvendefdt.value;                   
					      s1='Vend';
						}
    
                    	if (min1.indexOf('.') > -1)
                              {
                                      min1=min1.replace('.', ' ');

                              };


					   nefdt=f1.newGrpEffectDt.value;
                       if (nefdt!='--tonight--')
                       {
					   if (nefdt.indexOf('.') > -1)
                              {
                                      nefdt=nefdt.replace('.', ' ');

                               };

                       if (!isDateM(nefdt)) {
	                        s = 'Line ' + grpCnt + ': New Effect Date is Wrong!';
                            if (balert) {  alert(s); }
	                        xerr20=true;
	                    }
						else
						{
						  min1=dateAdd('s',1,min1);
					
					//------------check bill incre date------------------
						if ((f1.maxPrice.value !=f1.gvcost.value) && (f1.maxPrice.value !=null))
							{
								if (f1.newCustPrice.value - f1.maxPrice.value > 0.0)
								{
										//alert(f1.maxPrice[grpCnt-1].value+':'+f1.newCustPrice[grpCnt-1].value);
									if ((new Date(nefdt)) <= (new Date(mytime.replace(".",""))))
									{
									nefdt=mytime;
									f1.newGrpEffectDt.value=mytime;
									SJJ="Effective date was extended to "+mytime+" due to the rate increment periods.";
									
									}
								}
							}
							
					//-------------end-------------------------------
						  if ( (new Date(nefdt)) <= (new Date(min1)) )
				            {
                                s= 'Wrong Effect Date : less then Max '+s1+' Effect Date';
							    if (balert) {  alert(s); }
	                       		xerr20=true;
				            }
						}
                        } 

                        if (xerr20)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						}

                        f1.newGrpEffectDt.style.backgroundColor = xcol;
                        f1.newGrpEffectDt.title=s;
                        //f1.newGrpRetireDt.style.backgroundColor = xcol;

						max1=f1.maxvendrtdt.value;

						if (max1.indexOf('.') > -1)
                              {
                                      max1=max1.replace('.', ' ');

                              };


                       nrtdt=f1.newGrpRetireDt.value;
                       if (nrtdt!='--never--'&&nrtdt!='')
                       {
   					   if (nrtdt.indexOf('.') > -1)
                             {
                                      nrtdt=nrtdt.replace('.', ' ');

                               };

 
                  if (!isDateM(nrtdt)) {
	                        s = 'Line ' + grpCnt + ': New Retire Date is Wrong!';
							if (balert) {  alert(s); }
	                       	xerr2=true;
	                    }
						else
						{
                          
						  if (isDateM(nefdt))
						  {
						  min1=dateAdd('s',1,nefdt);
					
						  if ( (new Date(nrtdt)) <= (new Date(min1)) )
				            {
                                s='Wrong New Retire Date : less then New Effect Date'; 
								if (balert) {  alert(s); }
	                       		xerr2=true;
				            }
                          };

                          if (isDateM(max1))
						  {
						  //min1=dateAdd('s',1,nefdt);
					
						  if ( (new Date(max1)) <= (new Date(nrtdt)) )
				            {
                                s='Wrong New Retire Date : more then Max Vendor Retire Date'; 
                                if (balert) {  alert(s); }
	                       		
								xerr2=true;
				            }
                          };

						}
						}
                       
                        if (xerr2)
                        {
                           xcol='#FA8072';
                        }
						else
						{
                            xcol='white';
						}


                        f1.newGrpRetireDt.style.backgroundColor = xcol;
                        f1.newGrpRetireDt.title=s;

                       	fs.newCustPrice.value=f1.newCustPrice.value;
                        fs.newvbsId.value=f1.newvbsId.value; 
                        fs.newGrpEffectDt.value=f1.newGrpEffectDt.value;
                        fs.newGrpRetireDt.value=f1.newGrpRetireDt.value;
						fs.newCustPriceSave.value=f1.newCustPriceSave.value;
                        fs.newvbsIdSave.value=f1.newvbsIdSave.value; 
						fs.newvbsIdTextSave.value=f1.newvbsIdTextSave.value; 
                        fs.newGrpEffectDtSave.value=f1.newGrpEffectDtSave.value;
                        fs.newGrpRetireDtSave.value=f1.newGrpRetireDtSave.value;
					    fs.newrsId.value=f1.newrsId.value; 
					    fs.newrsIdSave.value=f1.newrsIdSave.value; 
                        fs.newrsIdColor.value=f1.newrsIdColor.value; 
                     
						fs.grpindex.value=f1.grpindex.value;

						};

						
 
 if (xerr1||xerr2||xerr20||xerr3)
 {
 if(xwarn)
 {
 CheckDirty(grpCnt);
 }
 return true;
 }
 else
 {
 actcount=actcount+1;
 CheckDirty(grpCnt);
 return false;
 };

 }
 
function doSubCust(gCnt) {
    var i,xerr,xerr1,xerr2,xdirty;
	 
	 xerr=false;
	 xdirty=false;
	 
	 actcount=0;

     for(i = 1; i <= gCnt; i++) {

			  xerr1=ValidateGroup(i,''); 
			  xerr=xerr||xerr1;
			  if(!xerr1) 
			  {
			   xerr2=CheckDirty(i);
               xdirty=xdirty||xerr2;
	 }        };
	         
    if (xerr)
	{

	alert("Please correct errors!");
	            return false;
	}


//	var err=document.frmCust.rederrf.value;

//	if (err !='')
//	{
//	alert("Please correct customer rate problems marked with red color!");
//	            return false;
//	}

	if (xdirty)
	{
      alert('You have changes to codes marked with brown that are not applied.\nPlease apply all changes !')
      return false;

	};

  if (actcount==0)
  {
   alert('Nothing to do...')
   return false;
  };

//-------------------increment period---------------------
			
		showerrSJJ(SJJ);
			
//----------------------------------------------------------------
	if(!confirm('Database is going to be changed. Proceed query?'))
          {
            return false;
          };

        fs.sIntention.value="saveall" //document.frmCust.isBack.value = 'true';
		fs.sgrpCnt.value=gCnt;
		KeepMainFilter();

		try{ 	 loadSubmit();	 } catch(e) {};
					
        fs.submit();
        return true;
	}



function doApplyAll(gCnt) {
    var i,xerr;

 actcount=0;

	for(i = 1; i <= gCnt; i++) {

			  xerr1=ValidateGroup(i,''); 
			  xerr=xerr||xerr1;
	
	};

    if (xerr)
	{

	alert("Please correct errors!");
	            return false;
	}

  if (actcount==0)
  {
   alert('Nothing to do...')
   return false;
  };
 //-------------------increment period---------------------
			
			showerrSJJ(SJJ);
			
			
//----------------------------------------------------------------
    if(!confirm('Database is going to be changed. Proceed query?'))
          {
            return false;
          };

        

        fs.sIntention.value="addallgrpsave"; //document.frmCust.isBack.value = 'true';
		fs.sallgrpCnt.value=gCnt;
		
		KeepMainFilter();

		for(i = 1; i <= gCnt; i++) {

        if(fs.newCustPrice.length != null) {
		fs.newCustPriceSave[i-1].value=fs.newCustPrice[i-1].value;
        fs.newvbsIdSave[i-1].value=fs.newvbsId[i-1].value;
		fs.newGrpRetireDtSave[i-1].value=fs.newGrpRetireDt[i-1].value;
	    fs.newGrpEffectDtSave[i-1].value=fs.newGrpEffectDt[i-1].value;
	
		}else
		{
		//f1.newCustPriceSave.value='0';
		fs.newCustPriceSave.value=fs.newCustPrice.value;
        fs.newvbsIdSave.value=fs.newvbsId.value;
		fs.newGrpRetireDtSave.value=fs.newGrpRetireDt.value;
	    fs.newGrpEffectDtSave.value=fs.newGrpEffectDt.value;
	 
		};

        }

        fs.sKeepTempTable.value='y';

        SetAllSkipGroupFlags();               

		fs.CheckNewPrice2copy.value=	f1.CheckNewPrice2copy.options[f1.CheckNewPrice2copy.selectedIndex].value;
		fs.newCustPrice2copy.value=f1.newCustPrice2copy.value; 
		fs.newBi2copy.value=f1.newBi2copy.value;
		fs.newRetireDt2copy.value=f1.newRetireDt2copy.value;
		fs.newEffectDt2copy.value=f1.newEffectDt2copy.value;

	 	try{ 	 loadSubmit();	 } catch(e) {};
		
        fs.submit();
        return true;

	}
					

  
		   
function doApplyCustGroup1(grpCnt) { //, voipuservendid, paramsql,paramfilt) {
    var s, xerrall;

       actcount=0;

       xerrall=ValidateGroup(grpCnt,'y');

	   
       if(xerrall)
		{
		 return false;
		}
		else
		{

  if (actcount==0)
  {
   alert('Nothing to do...')
   return false;
  };
//-------------------increment period---------------------
			
			showerrSJJ(SJJ);
			
//----------------------------------------------------------------
		if(!confirm('Database is going to be changed. Proceed query?'))
		{
		return false;
		};

        };
		
		KeepMainFilter();
		fs.sIntention.value='addgrpsave';

	    fs.sgrpCnt.value=grpCnt;
        fs.snprice.value=nprice;
		fs.snvbsid.value=nvbsid;
 
        fs.snrsid.value=nrsid;

        fs.snrtdt.value=nrtdt;
        fs.snefdt.value=nefdt;
        fs.sKeepTempTable.value='y';

        SetAllSkipGroupFlags();               

		fs.CheckNewPrice2copy.value=f1.CheckNewPrice2copy.options[f1.CheckNewPrice2copy.selectedIndex].value;
		fs.newCustPrice2copy.value=f1.newCustPrice2copy.value; 
		fs.newBi2copy.value=f1.newBi2copy.value;
		fs.newRetireDt2copy.value=f1.newRetireDt2copy.value;
		fs.newEffectDt2copy.value=f1.newEffectDt2copy.value;

         try{ 	 loadSubmit();	 } catch(e) {};
		
		fs.submit();
	    
		return true;
		
	}

 		
function doCopy2All(type) {
    var len,v;

		switch (type) {
		    case '0':
	        v=f1.CheckNewPrice2copy.selectedIndex;
			break;
		    case '1': 
			v=f1.newCustPrice2copy.value; 
			break;
			case '2':
			v=f1.newBi2copy.selectedIndex;
			break;
		    case '3':
            v=f1.newRetireDt2copy.value;
			break; 
            case '4':
            v=f1.newEffectDt2copy.value;
			break; 
			}

		len= f1.newCustPrice.length;  
   	
	    
        if(len != null) {
		for (i=1;i<=len;i++ )
		{
		if(!f1.skipgrp[i-1].checked)
		{
		switch(type) {
		case '0':
		if(document.getElementById('idnp'+i).options.length==2)
		{
		document.getElementById('idnp'+i).selectedIndex=v;
        fs.nnnp[i-1].value=v; 
        };
		break;
		case '1':
		//f1.newCustPriceSave[i-1].value=f1.newCustPrice[i-1].value;
		f1.newCustPrice[i-1].value=v; break;
        case '2':
        //f1.newvbsIdSave[i-1].value=f1.newvbsId[i-1].value;
	    f1.newvbsId[i-1].selectedIndex=v; break;
        break;
		case '3':
		//f1.newGrpRetireDtSave[i-1].value=f1.newGrpRetireDt[i-1].value;
		f1.newGrpRetireDt[i-1].value=v; break;
		case '4':
		//f1.newGrpEffectDtSave[i-1].value=f1.newGrpEffectDt[i-1].value;
		f1.newGrpEffectDt[i-1].value=v; break;

		}
		ValidateGroup(i,'');
		}
		}
		}
		else
		{
		if(!f1.skipgrp[i-1].checked)
		{
		switch(type) {
		case '0':
		if(document.getElementById('idnp'+1).options.length==2)
		{
		document.getElementById('idnp'+1).selectedIndex=v;
        fs.nnnp[0].value=v; 
        };
		break;

		case '1':
		//f1.newCustPriceSave.value=f1.newCustPrice.value;
		f1.newCustPrice.value=v; break;
        case '2':
        //f1.newvbsIdSave.value=f1.newvbsId.value;
		f1.newvbsId.selectedIndex=v; break;
       	break;
		case '3':
		//f1.newGrpRetireDtSave.value=f1.newGrpRetireDt.value;
		f1.newGrpRetireDt.value=v; break;
		case '4':
		//f1.newGrpEffectDtSave.value=f1.newGrpEffectDt.value;
		f1.newGrpEffectDt.value=v; break;

		}
  	    ValidateGroup(1,'');
        }
		};

	    return true;

}

	

 function doDialCode(p,prm) {
 var link,sp;
   
	if (fId != null)
			{
			return false;
			};

	link= prm ;

	sp=document.getElementById('idDstPattern').value;
	
	
   
	link = link +'&list='+sp ; //document.getElementById('idDstPattern').value;
	
   
  	return acctWin(p,link);

}

	if (fId != null)
			{

           
	    f1.fX1CustId.disabled=true;
		f1.fvoipUserId.disabled=true;
		f1.fDestination.disabled=true;	
		f1.fDestinationType.disabled=true;			
	    f1.fDestinationMobileCarrier.disabled=true;
		f1.fDescription.disabled=true;
		f1.fStatusId.disabled=true;
        f1.fAddVendorId.disabled=true;
        f1.mpartition.disabled=true;
        //f1.fAddNewRate.disabled=true;
			};


function doCheckretired(itn){
var i,n,s;

n=fs.numsgrp.value;

		switch (itn) {
     	
case 'checkall':
		
			for(i=1;i<=n;i++)
			{
			s='idgrpretirement'+i;

			if (!document.getElementById(s).checked)
			{
			document.getElementById(s).checked=true;
			};
			};
			return false;

			break;
case 'clearall':
			for(i=1;i<=n;i++)
			{
			s='idgrpretirement'+i;

			if (document.getElementById(s).checked)
			{
			document.getElementById(s).checked=false;
			};
			};
			return false;
	
		};
};

visibility('trEdit1',bShowEdit1);

</script>

