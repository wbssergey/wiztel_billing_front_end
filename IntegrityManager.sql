USE [wiztel]
GO
/****** Object:  StoredProcedure [dbo].[IntegrityManager]    Script Date: 08/24/2015 19:31:18 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[IntegrityManager] 
/*

INTEGRITY TESTS COLLECTION : DRAFT
Author: Sergey,  2011

--1  error in TERMS section CreditApproved
--2 in TERMS section edcditApproved
--3 test overlapped customer effective dates 
--31 test overlapped venodor effective dates 
--
--4 orphan vendor rates test
--5 orphan customer rates test
-- 6 x1customer objects chain integrity 
--7 find misplaced vdsid by cdrusername
--71 find ALL not assigned vdsid 
-- 8  find missed customer prices

-- 9 (slow) find cdrs marked on mysq side as transferred but missed on mssql side
-- 91 (faster) find cdrs marked on mysq side as transferred but missed on mssql side
-10 
--11 match between partition if and refpartition  21 mar 2012

declare @result int;

exec IntegrityManager @transaction = 1, @result=@result out;

exec IntegrityManager @transaction=8 ,@view=1 ,@cdrusername ='wnq_cust'


exec IntegrityManager  @transaction=10 --- cdr_archive and cdrs compare 
exec IntegrityManager  @transaction=101 --- cdr_usa_archive and cdrs_usa compare 

exec IntegrityManager  @query=11 --- list of arbinet objects ( fee related)

exec IntegrityManager @transaction=92 -- purge [wiztel].[dbo].[tblVoipCdrDstNum]

exec IntegrityManager @transaction_name ='radiuscorrection'
exec IntegrityManager @transaction_name ='vrusernamecorrection'

*/
@result int  = 0 out,
@transaction int =0,
@transaction_name varchar(20) ='',
@unixid int = 0,
@cdrdcontext varchar(max) = 'MVTS-PRO1' ,
@view bit= 0,
@cdrusername varchar(max) = '',
@vrusername varchar(max) = '',
@cunixid int =0,
@query int = 0 ,
@destfilter varchar(max) = '',
@destfilter1 varchar(max) = 'Mobile',

@syslabuser varchar(50) = '',
@vvdid int = 0,
@voipuserid int = 0,
@partitionid int = 0
as
begin
declare @q varchar(max);
declare @q1 varchar(max);

declare @mincdrid bigint;
declare @maxcdrid bigint;
declare @mindt_a datetime;
declare @maxdt_a datetime;
declare @mindt datetime;
declare @maxdt datetime;

declare @mindt_a2 datetime;
declare @maxdt_a2 datetime;
declare @c_a bigint;
declare @c_a2 bigint;
declare @c bigint;
declare @i int;
declare @k int;

SET NOCOUNT ON;

declare @exepath varchar(max) 

SELECT @exepath=virtdir from [wiztel].[dbo].[1_1partitionsetup] where partitionid=-1;

set @exepath=@exepath + '\manager\schedule\';


create table #tempspool4 (id int identity(1,1) not null,f varchar(max));


if  @transaction_name='vrusernamercorrection'
begin


 set @c=1000;
 set @k=0;
 
 while @k <@c
 begin
-- 23964883
--23964738
 update tblvoipcdrs_usa set vrusername='tul_vend'-- @destfilter
  where cdrid in (
  select top 1000 cdrid  from tblvoipcdrs_usa where 
 cdrId in (select cdrId from z_gmcdrtblTempVoipCdrs where 1=1
  and cdrUserName='sss_cust'
and vrUserName ='gul_vend' --@vrusername
 ) and vrUserName ='gul_vend'--@vrusername
);


 select count(*) from tblvoipcdrs_usa where 
 cdrId in (select cdrId from z_gmcdrtblTempVoipCdrs where 1=1 
   and cdrUserName='sss_cust'
and vrUserName = 'gul_vend'--@vrusername 
 ) and vrUserName = 'gul_vend' ;--@vrusername;


set @k=@k+1;
print(@i);
print(@k);


 end

return;
end;

if  @transaction_name='radiuscorrection'
begin


 select  vrUserName,cdrUserName,meraSrcName,meraDstName ,count(*) mc,
 sum(cdrbillsec)/60.0 minutes , min(cdrcalldate) mindt,
 max(cdrcalldate) maxdt from tblvoipcdrs_usa where 
 cdrId in (select cdrId from z_gmcdrtblTempVoipCdrs where 1=1 
 and cdrUserName=@cdrusername --'sss_cust'
and vrUserName = @vrusername --in ('tul_vend') 
 )
 and not (vdsid >= 15072 and vdsid <= 15078) --not in 
 -- (select distinct vdsid from tblVoIPDestinationUSA )
 group by vrUserName,cdrUserName,meraSrcName,meraDstName;
 
 set @c=1000;
 set @k=0
 
 while @k <@c
 begin
 
 update tblvoipcdrs_usa set vdsid= dbo.GetVdsIDUSA(cdrdstnum) where cdrid in (
  select top 1000 cdrid from tblvoipcdrs_usa where 
 cdrId in (select cdrId from z_gmcdrtblTempVoipCdrs where 1=1
  and cdrUserName=@cdrusername --'sss_cust'
and vrUserName = @vrusername --in ('tul_vend') 
 )
 and not (vdsid >= 15072 and vdsid <= 15078) 
);

delete from z_gmcdrtblTempVoipCdrs where cdrId in
(
  select  cdrid from tblvoipcdrs_usa where 
 cdrId in (select cdrId from z_gmcdrtblTempVoipCdrs where 1=1
  and cdrUserName=@cdrusername --'sss_cust'
and vrUserName = @vrusername --in ('tul_vend') 
) and (vdsid >= 15072 and vdsid <= 15078)
);

 select @i=count(*) from tblvoipcdrs_usa where 
 cdrId in (select cdrId from z_gmcdrtblTempVoipCdrs where 1=1 
   and cdrUserName=@cdrusername --'sss_cust'
and vrUserName = @vrusername --in ('tul_vend') 
 )
 and not (vdsid >= 15072 and vdsid <= 15078) 
;

set @k=@k+1;

if @i=0 set @k=@c;
print(@i);
print(@k);

 end
return;

end;


if  @transaction_name='negativemargin'
begin
/*
exec IntegrityManager
@transaction_name='negativemargin', @voipuserid=467 ;

*/
select dbo.mGetUCOrg_byid(voipuserid) customer, dbo.mGetUROrg_byid(vvdid) supplier,
vdsName,vdsType,
  xc.AccountStatus CAccountStatus, xc2.AccountStatus SAccountStatus,
MAX(rc.vrceffectdt) maxeffectivedt,MAX(rc.vrcretiredt) maxretireddt,
dbo.mGetUC_byid(voipuserid) username, voipuserid, vvdid,
count(*) count, 
MIN(vrcPrice-vrtCost) minmargin,Max(vrcPrice-vrtCost) maxmargin

 from tblVoIPRateCustomer rc join
tblvoiprate vr on vr.vrtId=rc.vrtId
join tblVoIPUserCustomer uc on uc.Id=rc.voipUserId
join tblVoIPUserRoute ur on ur.voipUserVendId=vr.vvdid

join X1Customer xc on xc.ID=uc.x1custid
join X1Customer xc2 on xc2.ID=ur.x1custid
join tblvoipdestination ds on ds.vdsid=vr.vdsid
where vrtCost - vrcPrice > 0
and ISNULL(rc.vrcretiredt,0)=0
--and vrceffectdt >='2014-01-01'
and voipuserid=@voipuserid --467-- and xc.AccountStatus <> 'Active'
group by vdsName,vdsType,
voipuserid, vvdid,xc.AccountStatus ,xc2.AccountStatus 
order by customer,vdsname,vdstype;


 return;
end;

if  @transaction_name='segmentation'
begin


--exec IntegrityManager  @transaction=10 --- cdr_archive and cdrs compare 
select @mindt_a=min(cdrcalldate), @maxdt_a=max(cdrcalldate),@c_a=count(*) from tblvoipcdrs_archive;
select @mindt=min(cdrcalldate) , @maxdt=max(cdrcalldate) , @c=count(*) from tblvoipcdrs;
select @mindt_a2=min(cdrcalldate), @maxdt_a2=max(cdrcalldate),@c_a2=count(*) from tblvoipcdrs_archive_part2;

select @mindt_a mindt_a, @maxdt_a maxdt_a, @mindt_a2 mindt_a2, @maxdt_a2 maxdt_a2, @mindt mindt, @maxdt maxdt, 
 datediff(day,@mindt,getdate()) dif , @c_a C_A, @c_a2 C_A2, @c C ;

print (datediff(day,@maxdt_a2,@mindt) );

--exec IntegrityManager  @transaction_name='segmentation' --- cdr_usa_archive and cdrs_usa compare 

return;
end

if @transaction=3
begin
--- test overlapped effective dates 
/*

exec IntegrityManager @transaction=3, @destfilter='ECUADOR'
,@cunixid=23289;

exec IntegrityManager @transaction=3, @destfilter='ECUADOR'
,@cdrusername='mslh_cust';

exec IntegrityManager @transaction=3, @destfilter='ECUADOR',
@voipuserid=1054

exec IntegrityManager @transaction=3, @destfilter='ECUADOR',@vvdid=1245,@voipuserid=1054
*/
if @cunixid <> 0 
select top 1 @cdrusername=uc.username from tblVoIPUserCustomer uc join X1Customer xc 
on xc.ID=uc.x1custid where xc.AccountStatus='Active' and xc.id=@cunixid order by uc.username; 

if @cdrusername <> '' select @voipuserid=ID from tblVoIPUserCustomer where userName=@cdrusername;
if @vvdid=0
begin
select distinct vdsname, vdstype,vdsmobilecarrier,vdsdescription,vendor, x.username vrusername,x.vvdid , mc,edactive,edretire,xc.organization customer,uc.username cdrusername,uc.x1custid custid,
x.voipuserid ,userby1,userby2 ,mincreated,maxcreated from
(
select xc.id vendid,ds.vdsname,ds.vdstype,ds.vdsmobilecarrier,ds.vdsdescription,ds.vdsdialcode,ds.vdsisactive,voipUserId,xc.organization Vendor,userName,vr.vvdid, MAX(vrceffectdt) edactive,MIN(rc.userby) userby1,
MAX(rc.userby) userby2 ,MIN(vrccreateddt) mincreated, MAX(vrccreateddt) maxcreated from tblVoIPRateCustomer rc
join tblVoIPRate vr on vr.vrtId=rc.vrtid 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
join tblVoIPUserRoute ur on ur.voipUserVendId=vr.vvdid
join x1customer xc on xc.id=ur.x1custid

where  ds.vdsisactive=1 and   (vrcRetireDt is null) and voipUserId = @voipuserid -- '908'
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by voipUserId,vvdId,ur.userName, xc.id,xc.organization,ds.vdsname,ds.vdstype,
ds.vdsmobilecarrier,ds.vdsdescription,ds.vdsdialcode,ds.vdsisactive
) x
join (
select count(*) mc,ds.vdsdialcode,vvdid, voipUserId, MAX(vrceffectdt) edretire from tblVoIPRateCustomer rc
join tblVoIPRate vr on vr.vrtId=rc.vrtid 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where  ds.vdsisactive=1 and (not vrcRetireDt is null) and voipUserId = @voipuserid --'908'
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by voipUserId,vvdid,ds.vdsdialcode
) y  on x.voipuserid=y.voipuserid and x.vvdId=y.vvdid
join tblVoIPUserCustomer uc on uc.Id=x.voipUserId
join X1Customer xc on xc.ID=uc.x1custid
where edactive < edretire
order by vendor,vdsname, vdstype,vdsmobilecarrier,vdsdescription
;
end
else
begin
select xc.organization,uc.username,uc.x1custid,x.*,y.* from
(
select ds.vdsname,ds.vdsdialcode,ds.vdsisactive,voipUserId,vr.vvdid, MAX(vrceffectdt) edactive,MIN(rc.userby) userby1,MAX(rc.userby) userby2 from tblVoIPRateCustomer rc
join tblVoIPRate vr on vr.vrtId=rc.vrtid 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where    ds.vdsisactive=1 and   vr.vvdid=@vvdid and (vrcRetireDt is null) and voipUserId = @voipuserid -- '908'
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by voipUserId,vvdId, ds.vdsname,ds.vdsdialcode,ds.vdsisactive
) x
join (
select ds.vdsdialcode,vvdId, voipUserId, MAX(vrceffectdt) edretire from tblVoIPRateCustomer rc
join tblVoIPRate vr on vr.vrtId=rc.vrtid 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where    ds.vdsisactive=1 and   vr.vvdid=@vvdid and (not vrcRetireDt is null) and voipUserId = @voipuserid --'908'
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by voipUserId,ds.vdsdialcode,vvdid
) y on x.voipuserid=y.voipuserid and x.vvdId=y.vvdid
join tblVoIPUserCustomer uc on uc.Id=x.voipUserId
join X1Customer xc on xc.ID=uc.x1custid
where edactive < edretire;
end
return
end
if @transaction=31
begin
--- test overlapped vendor effective dates 
if @cunixid <> 0 
select top 1 @cdrusername=uc.username from tblVoIPUserCustomer uc join X1Customer xc 
on xc.ID=uc.x1custid where xc.AccountStatus='Active' and xc.id=@cunixid order by uc.username; 

if @cdrusername <> '' select @voipuserid=ID from tblVoIPUserCustomer where userName=@cdrusername;
if @vvdid=0
begin
select xc.organization,uc.username,uc.x1custid,x.*,y.* from
(
select ds.vdsname,ds.vdsdialcode,ds.vdsisactive,vr.vvdid, MAX(vrteffectdt) edactive,
MIN(vr.userby) userby1,MAX(vr.userby) userby2 
from tblVoIPRate vr 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where    ds.vdsisactive=1 and    (vrtRetireDt is null)
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by vvdId, ds.vdsname,ds.vdsdialcode,ds.vdsisactive
) x
join (
select ds.vdsdialcode, vvdid, MAX(vrteffectdt) edretire from 
 tblVoIPRate vr
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where    ds.vdsisactive=1 and    (not vrtRetireDt is null) 
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by vvdid,ds.vdsdialcode
) y on x.vvdid= y.vvdid and  y.vdsDialcode=x.vdsDialcode
join tblVoIPUserroute uc on uc.voipUserVendId=x.vvdid
join X1Customer xc on xc.ID=uc.x1custid
where  edactive < edretire;
end
else
begin
select xc.organization,uc.username,uc.x1custid,x.*,y.* from
(
select ds.vdsname,ds.vdsdialcode,ds.vdsisactive,vr.vvdid, 
MAX(vrteffectdt) edactive,MIN(vr.userby) userby1,MAX(vr.userby) userby2 
from tblVoIPRate vr 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where    ds.vdsisactive=1 and   vr.vvdid=@vvdid and (vrtRetireDt is null) 
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by vvdId, ds.vdsname,ds.vdsdialcode,ds.vdsisactive
) x
join (
select ds.vdsdialcode,vvdId,  MAX(vrteffectdt) edretire from 
tblVoIPRate vr 
join tblVoIPDestination ds on ds.vdsId=vr.vdsid
where    ds.vdsisactive=1 and   vr.vvdid=@vvdid and (not vrtRetireDt is null) 
and ds.vdsName=@destfilter and ds.vdsType=@destfilter1
group by ds.vdsdialcode,vvdid
) y on x.vvdId=y.vvdid and y.vdsDialcode=x.vdsDialcode
join tblVoIPUserRoute uc on uc.voipUserVendId=x.vvdid
join X1Customer xc on xc.ID=uc.x1custid
where edactive < edretire;
end
return
end

if @transaction=1
begin
-- error in TERMS section CreditApproved
 select distinct clog.custid,clog.CreditApproved,xc.CreditApproved ,xc.organization,xc.accountstatus from X1Customer xc 
 left join 
( select distinct clog.CustId,creditapproved from tblCreditDetailsLog clog
 join(
select CustId, MAX(CreditApprovedDate)maxdt from tblCreditDetailsLog group by custid
) x on x.maxdt=clog.CreditApprovedDate)
clog on clog.CustId=xc.ID
 where clog.custID is null order by clog.custid

 select distinct clog.custid,clog.CreditApproved CreditApprovedlog,xc.CreditApproved, xc.organization,xc.accountstatus from X1Customer xc 
 left join 
( select distinct clog.CustId,creditapproved from tblCreditDetailsLog clog
 join(
select CustId, MAX(CreditApprovedDate)maxdt from tblCreditDetailsLog group by custid
) x on x.maxdt=clog.CreditApprovedDate)
clog on clog.CustId=xc.ID
 where not clog.custID is null 
 and clog.CreditApproved <> xc.creditapproved
 order by clog.custid

 select distinct clog.custid,clog.CreditApproved CreditApprovedlog,xc.CreditApproved, xc.organization,xc.accountstatus from X1Customer xc 
 left join 
( select distinct clog.CustId,creditapproved from tblCreditDetailsLog clog
 join(
select CustId, MAX(CreditApprovedDate)maxdt from tblCreditDetailsLog group by custid
) x on x.maxdt=clog.CreditApprovedDate)
clog on clog.CustId=xc.ID
 where not clog.custID is null 
 and clog.CreditApproved = xc.creditapproved
 order by clog.custid

return
end


if @transaction = 2
begin
-- error in TERMS section edcditApproved

 select distinct clog.custid,clog.edcCreditApproved,xc.edcCreditApproved ,xc.organization,xc.accountstatus from X1Customer xc 
 left join 
( select distinct clog.CustId,edccreditapproved from tbledcCreditDetailsLog clog
 join(
select CustId, MAX(edcCreditApprovedDate)maxdt from tbledcCreditDetailsLog group by custid
) x on x.maxdt=clog.edcCreditApprovedDate)
clog on clog.CustId=xc.ID
 where clog.custID is null order by clog.custid

 select distinct clog.custid,clog.edcCreditApproved edcCreditApprovedlog,xc.edcCreditApproved, xc.organization,xc.accountstatus from X1Customer xc 
 left join 
( select distinct clog.CustId,edccreditapproved from tbledcCreditDetailsLog clog
 join(
select CustId, MAX(edcCreditApprovedDate)maxdt from tbledcCreditDetailsLog group by custid
) x on x.maxdt=clog.edcCreditApprovedDate)
clog on clog.CustId=xc.ID
 where not clog.custID is null 
 and clog.edcCreditApproved <> xc.edccreditapproved
 order by clog.custid

 select distinct clog.custid,clog.edcCreditApproved edcCreditApprovedlog,xc.edcCreditApproved, xc.organization,xc.accountstatus from X1Customer xc 
 left join 
( select distinct clog.CustId,edccreditapproved from tbledcCreditDetailsLog clog
 join(
select CustId, MAX(edcCreditApprovedDate)maxdt from tbledcCreditDetailsLog group by custid
) x on x.maxdt=clog.edcCreditApprovedDate)
clog on clog.CustId=xc.ID
 where not clog.custID is null 
 and clog.edcCreditApproved = xc.edccreditapproved
 order by clog.custid

return
end

if @transaction=4
begin
--  orphan vendor rates test

select distinct xc.id, vr.vvdid,ur.voipUserVendId,ur.x1CustId, ur.userName,ur.description 
from tblvoiprate vr -- 187 with left 187
 join tblvoipuserroute ur on ur.voipUserVendId=vr.vvdId  --184
 left join X1Customer xc on xc.ID=ur.x1CustId --
 where xc.id is null
 
 return
 

end



if @transaction=5
begin
--  orphan customer rates test

select distinct xc.id, rc.voipuserid, uc.x1CustId, uc.userName,
uc.description from tblvoipratecustomer rc -- 187 with left 187
 join tblvoipusercustomer uc on uc.id=rc.voipuserid  --184
 left join X1Customer xc on xc.ID=uc.x1CustId --
 where xc.id is null
 
 return
 

end



if @transaction = 6
begin
-- x1customer chain integrity --22939 (GBP_BT)
	declare @ctest int
	
select @ctest=count(*) from tblUserPrivilegeUsr where userid in(
 select userid from tbluser where userunixid=@unixid)
 
 print(@ctest);
 

select @ctest=count(*) from tblUserPrivilegeUsr where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
 )

 print(@ctest);



select @ctest=count(*) from dbo.tblUserAlias where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
 )


 print(@ctest);
 
select @ctest=count(*) from dbo.tblVoIPRoutes
   where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
				)


 print(@ctest);

	select @ctest=count(*) from  tblVoIPCustomerIPsToGatekeepers where vcipid in --", column 'vcipId'.
	 (select vcipid from tblVoIPCustomerIPs
		 where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
				))


 print(@ctest);
				
	select @ctest=count(*) from tblVoIPCustomerIPs
		  where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
				)	


 print(@ctest);
				
			select @ctest=count(*) from  tblVoIPCustomers	
	  where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
				)


 print(@ctest);
		
select @ctest=count(*) from  dbo.tblVoIPUser
  where userId in
(select userid from tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)
				)


 print(@ctest);
				
		select @ctest=count(*) from  tblUserDeletedBilling 
 where custid in (select custid from tblcustomer 
				where x1custid=@unixid)


 print(@ctest);
				
select @ctest=count(*) from  tbluser 
  where custid in (select custid from tblcustomer 
				where x1custid=@unixid)


 print(@ctest);
				
select @ctest=count(*) from  tblcustomer where x1custid=@unixid


 print(@ctest);

select @ctest=count(*) from  tblcustomercontacts where custid=@unixid


 print(@ctest);

select @ctest=count(*) from  X3AccountServices where ID=@unixid


 print(@ctest);

select @ctest=count(*) from  [XInvoice details] where InvoiceID in
(select InvoiceID from XInvoices where CustomerID=@unixid)


 print(@ctest);

select @ctest=count(*) from  [XInvoiceus details] where InvoiceID in
(select InvoiceID from XInvoices where CustomerID=@unixid)

 print(@ctest);
 
 
select @ctest=count(*) from  X4PaymentDetails where InvoiceID in
(select InvoiceID from XInvoices where CustomerID=@unixid)

 print(@ctest);

select @ctest=count(*) from [Statement] where CustomerID=@unixid

 print(@ctest);

select @ctest=count(*) from XInvoices where CustomerID=@unixid

 print(@ctest);

select @ctest=count(*) from x1customer where id=@unixid

 print(@ctest);



select @ctest=count(*) from  tblVoIPRateCustomer where vrtid in
(select vrtid from tblvoiprate where vvdid in
(select voipUserVendId from tblVoIPUserRoute where x1CustId=@unixid)
);
 print(@ctest);

select @ctest=count(*) from tblVoIPRateCustomer where voipuserid in
(select id from tblVoIPUserCustomer where x1CustId= @unixid);
 print(@ctest);

select @ctest=count(*) from  tblVoIPRate where vvdId in
(select voipUserVendId from tblVoIPUserRoute where x1CustId=@unixid);
 print(@ctest);

select @ctest=count(*) from  tblVoIPUserRoute where x1CustId=@unixid

 print('tblVoIPUserRoute:');
 print(@ctest);

select @ctest=count(*) from  tblVoIPUserCustomer where x1CustId=@unixid
 print('tblVoIPUserCustomer:');

 print(@ctest);

 return


end

if @transaction = 7
begin
-- find misplaced vdsid by cdrusername

select count(*) mc from 
(
select	distinct dbo.GetVdsIDNonUSA(cdrdstnum) fdsid,cdr.vdsId,cdr.cdrid
  from tblvoipcdrs cdr   left join  ( select distinct vuc.id,vuc.username cust, vu.username vend, vrc.vrcPrice, vrc.vrcEffectDt,  isnull(isnull(vrc.vrcRetireDt,vr.vrtretiredt), getdate())   as vrcRetireDt, vrc.vbsid, vr.vdsid, vr.vrtCost   from tblVoipUsercustomer vuc   join tblVoipRateCustomer vrc on vuc.id=vrc.voipUserid   join tblVoipRate vr on vrc.vrtId=vr.vrtId   join tblVoipUserRoute vu on vr.vvdId=vu.voipUserVendId  join  (  select distinct isnull(CdrUsername,'') CdrUsername,  isnull(vrUsername,'') vrUsername
   from tblvoipcdrs )  tmp on tmp.cdrusername=isnull(vuc.username,'')  
   and tmp.vrusername=isnull(vu.username,'')   )  z on cdr.vdsid=z.vdsid   
   and cdr.vrusername=z.vend   and cdr.cdrusername=z.cust   and z.vrcEffectDt <= cdr.cdrcalldate 
   and isnull(z.vrcRetireDt,getdate()) >= cdr.cdrcalldate   
   left join tblVoipDestination vd2 on cdr.vdsid=vd2.vdsid   
   left join tblVoipBillingStructure bs on z.vbsid=bs.vbsid   
   where not( (vd2.vdsname ='USA') and (vd2.vdstype='Continental') )  
   and vrcprice is null and 
   cdr.cdrusername='wnq_cust'
) x where fdsid<>vdsid

 return
end
if @transaction = 71
begin
-- find misplaced all vdsid
select count(*) mc from tblvoipcdrs cdr
 left join tblVoipDestination vd2 on cdr.vdsid=vd2.vdsid   
 where cdr.vdsid <=0
 and not( (vd2.vdsname ='USA') and (vd2.vdstype='Continental') )  

if @view=1 
begin
select cdr.* from tblvoipcdrs cdr
 left join tblVoipDestination vd2 on cdr.vdsid=vd2.vdsid   
 where cdr.vdsid <=0
 and not( (vd2.vdsname ='USA') and (vd2.vdstype='Continental') )  
end

 return
end

if @transaction=8
begin
-- find missed customer prices


if @view = 0
begin

select count(*) mc 
  from tblvoipcdrs cdr   left join  ( select distinct vuc.id,vuc.username cust, vu.username vend, vrc.vrcPrice, vrc.vrcEffectDt,  isnull(isnull(vrc.vrcRetireDt,vr.vrtretiredt), getdate())   as vrcRetireDt, vrc.vbsid, vr.vdsid, vr.vrtCost   from tblVoipUsercustomer vuc   join tblVoipRateCustomer vrc on vuc.id=vrc.voipUserid   join tblVoipRate vr on vrc.vrtId=vr.vrtId   
  join tblVoipUserRoute vu on vr.vvdId=vu.voipUserVendId  
  join  (  select distinct isnull(CdrUsername,'') CdrUsername,  isnull(vrUsername,'') vrUsername
   from tblvoipcdrs )  tmp 
   on tmp.cdrusername=isnull(vuc.username,'')  and tmp.vrusername=isnull(vu.username,'')   )  z 
   on cdr.vdsid=z.vdsid   and cdr.vrusername=z.vend   and cdr.cdrusername=z.cust  
    and z.vrcEffectDt <= cdr.cdrcalldate and isnull(z.vrcRetireDt,getdate()) >= cdr.cdrcalldate 
      left join tblVoipDestination vd2 on cdr.vdsid=vd2.vdsid  
       left join tblVoipBillingStructure bs on z.vbsid=bs.vbsid   
   where not( (vd2.vdsname ='USA') and (vd2.vdstype='Continental') )  
   and vrcprice is null and 
   cdr.cdrusername=@cdrusername

end

if @view = 1
begin

select distinct xc.organization vendor,vd2.vdsisactive,vd2.vdsdialcode,z.vrtCost,vd2.vdsname, vd2.vdsType,vd2.vdsMobileCarrier,vd2.vdsDescription,
 cdr.cdrUserName,cdr.vrusername,z.vrtEffectDt,z.vrcEffectDt,z.vrcRetireDt
  from tblvoipcdrs cdr   left join  ( select distinct vuc.id,vuc.username cust, vu.username vend, vrc.vrcPrice,vr.vrtEffectDt, vrc.vrcEffectDt,  isnull(isnull(vrc.vrcRetireDt,vr.vrtretiredt), getdate())   as vrcRetireDt, vrc.vbsid, vr.vdsid, vr.vrtCost   from tblVoipUsercustomer vuc   
  join tblVoipRateCustomer vrc on vuc.id=vrc.voipUserid  
   join tblVoipRate vr on vrc.vrtId=vr.vrtId   
  join tblVoipUserRoute vu on vr.vvdId=vu.voipUserVendId  
  join  (  select distinct isnull(CdrUsername,'') CdrUsername,  isnull(vrUsername,'') vrUsername
   from tblvoipcdrs )  tmp 
   on tmp.cdrusername=isnull(vuc.username,'')  and tmp.vrusername=isnull(vu.username,'')   )  z 
   on cdr.vdsid=z.vdsid   and cdr.vrusername=z.vend   and cdr.cdrusername=z.cust  
    and z.vrcEffectDt <= cdr.cdrcalldate and isnull(z.vrcRetireDt,getdate()) >= cdr.cdrcalldate
    join tblVoipUserRoute ur on ur.userName=cdr.vrUserName
    join X1Customer xc on xc.id=ur.x1custid 
      left join tblVoipDestination vd2 on cdr.vdsid=vd2.vdsid  
   where not( (vd2.vdsname ='USA') and (vd2.vdstype='Continental') )  
   and vrcprice is null 
   and  cdr.cdrusername=(case when isnull(@cdrusername,'')='' then  cdr.cdrusername 
   else @cdrusername end)
   order by xc.organization,vd2.vdsdialcode

end

 return


end
if @query=10 
begin

set @q='select 
replace(xc.organization,part.shortname,'''') + ''[''+part.shortname+''].'' as  customer,
replace(xc2.organization,part2.shortname,'''') + ''[''+part2.shortname+''].'' as  vendor,
rc.voipUserId,vr.vvdId,vdsname,ds.vdstype,ds.vdsmobilecarrier, 
ds.vdsdescription, rc.vrcPrice,vr.vrtcost,vr.vrteffectdt,rc.vrceffectdt
 from tblVoIPRateCustomer rc
join tblvoiprate vr on vr.vrtid=rc.vrtid
join tblvoipdestination ds on ds.vdsid=vr.vdsid
join tblvoipusercustomer uc on uc.id=rc.voipUserId
join X1Customer xc on xc.ID=uc.x1custid
join tblvoipuserroute ur on ur.voipUserVendId=vr.vvdid
join X1Customer xc2 on xc2.ID=ur.x1custid
join dbo.fnGetPartitionsByUser('''+@syslabuser+''')  part on 
isnull(xc.partitionid,-1)=part.partitionid ' 

if @partitionid <> 0 set @q=@q + '  and part.partitionid=' + cast(@partitionid as varchar)

set @q=@q+' join dbo.fnGetPartitionsByUser('''+@syslabuser+''')  part2 on isnull(xc2.partitionid,-1)=part2.partitionid ' ;

if @partitionid <> 0 set @q=@q + '  and part2.partitionid=' + cast(@partitionid as varchar)

set @q=@q + ' where rc.vrcRetireDt is null '
set @q=@q + ' and  vr.vrtRetireDt is null '

if @partitionid <> 0 set @q=@q +' and part.partitionid='+ CAST(@partitionid as varchar) 
if @unixid <> 0 set @q=@q + ' and xc.id='+CAST(@unixid as varchar)
if @destfilter <> '' set @q=@q + @destfilter 
set @q=@q + ' and ds.vdsIsActive=1 and xc.AccountStatus=''Active'' and xc2.AccountStatus=''Active'' 
group by xc.Organization,xc2.Organization,rc.voipUserId,vr.vvdId,ds.vdsname,ds.vdstype,ds.vdsmobilecarrier, 
ds.vdsdescription, rc.vrcPrice,vr.vrtcost,vr.vrteffectdt,rc.vrceffectdt,part.shortname,part2.shortname
order by xc.Organization,xc2.Organization,
ds.vdsname,ds.vdstype,ds.vdsmobilecarrier, 
ds.vdsdescription,vr.vrteffectdt,rc.vrceffectdt'
print(@q)
exec(@q)

return
end
if @query=11 
begin

set @q=' select organization, accountstatus,* from x1customer where id in ';
set @q=@q+ '( select x1custid from tblvoipusercustomer where username in ';
set @q=@q+ dbo.fnCorrectionCostByFee(-2,'?','') ;
set @q=@q+ ')';

print(@q)
exec(@q)

return
end

if @transaction = 9  --slow version
begin
-- find cdrs marked on mysq side as transferred but missed on mssql side
  --select getdate()
  -- select dateadd(day,-2,dbo.fntruncdate(getdate()))
  /*
select x.cdr_id,cdr.merarecordid,cdr.* from tblVoIPCDRs cdr
left join (

select * from openquery (mvtspro,' select * from wbs.mycdrmarks where cdr_id=''201112000387856631''  ')
) x 
on x.cdr_id  = cdr.merarecordid
where 
cdrcalldate >=dateadd(day,-2,dbo.fntruncdate(getdate()))
and cdrcalldate >=dateadd(day,-1,dbo.fntruncdate(getdate()))
and   not x.cdr_id is null
*/

--declare @q varchar(max);

set @q='select  MIN(cdr_id) mincdrid, MAX(cdr_id) maxcdrid from mvtspro.mvts_cdr where
last_cdr=1 and ifnull(connect_time,0) <> 0 and ifnull(disconnect_time,0) <> 0 
and connect_time <> disconnect_time and connect_time >= '''+
convert(varchar,dateadd(day,-2,dbo.fntruncdate(getdate())),20)+
''' and disconnect_time <= '''+
convert(varchar,dateadd(day,-1,dbo.fntruncdate(getdate())),20)+''' ';

print(@q)
set @q=REPLACE(@q,'''','''''');

set @q='select * from openquery(mvtspro,'''+@q+''') ';

print(@q);
exec(@q);


select  x.cdr_id  from (
select cdr_id from openquery (mvtspro,' select * from wbs.mycdrmarks 
where cdr_id >=''201112000381678381''  and cdr_id <= ''201112000395584171'' ')
) x
left join (select * from wiztel..tblvoipcdrs cdr
where 
cdrcalldate >=dateadd(day,-2,dbo.fntruncdate(getdate()))
and cdrcalldate <=dateadd(day,-1,dbo.fntruncdate(getdate()))
) cdr 
on cdr.meraRecordID=x.cdr_id
where 
cdr.merarecordid is null

return
end
if @transaction = 90
begin
/*
 exec dbo.IntegrityManager @transaction = 90
*/
--declare @maxcdrid bigint;

set @maxcdrid=(select max(cdr_id) from wiztel..mycdrmarks);
set @maxcdrid=ISNULL(@maxcdrid,0);

set @q=' select * from wbs.mycdrmarks where cdr_id > '+cast(@maxcdrid as varchar);
--set @q=' select * from wbs.mycdrmarks where 1=1 '

set @q='insert into wiztel..mycdrmarks(mark_id,cdr_id,calldate,wbscdrid)
select ID , cdr_id ,null ,null  from openquery (mvtspro,'''+@q+''')
where cdr_id not in (select cdr_id from wiztel..mycdrmarks)';

exec(@q);

update marks set wbscdrid=x.cdrid,calldate=x.cdrcalldate from
(select * from tblVoIPCDRs where cdrCallDate >= dateadd(day,-7,dbo.fnTruncDate(getdate()))
and cdrCallDate <= dateadd(day,1,dbo.fnTruncDate(getdate()))
) x,
 wiztel..mycdrmarks marks where marks.calldate is null and marks.cdr_id=x.merarecordid

return
end

if @transaction = 91
begin
--select count(*) from wiztel..mycdrmarks  2190549
-- truncate table wiztel..mycdrmarks
 
--select * from  wiztel..mycdrmarks  where calldate is null --172  2159031
--select distinct cdr_id from  wiztel..mycdrmarks  where  calldate is null --172  

 truncate table [wiztel].[dbo].[mvtspro_cdrs_export]
truncate table  [wbs].[dbo].[mysqlcdrtrackersave2];

INSERT INTO [wbs].[dbo].[mysqlcdrtrackersave2]
           ([cdr_id]
           ,[cdr_date]
           ,[in_ani]
           ,[in_dnis]
           ,[out_ani]
           ,[out_dnis]
           ,[bill_ani]
           ,[bill_dnis]
           ,[sig_node_name]
           ,[src_gatekeeper_address]
           ,[remote_src_sig_address]
           ,[remote_dst_sig_address]
           ,[remote_src_media_address]
           ,[remote_dst_media_address]
           ,[local_src_sig_address]
           ,[local_dst_sig_address]
           ,[local_src_media_address]
           ,[local_dst_media_address]
           ,[in_leg_proto]
           ,[out_leg_proto]
           ,[conf_id]
           ,[in_leg_call_id]
           ,[out_leg_call_id]
           ,[src_user]
           ,[dst_user]
           ,[radius_user]
           ,[src_name]
           ,[dst_name]
           ,[dp_name]
           ,[elapsed_time]
           ,[setup_time]
           ,[connect_time]
           ,[disconnect_time]
           ,[disconnect_code]
           ,[in_leg_codecs]
           ,[out_leg_codecs]
           ,[src_faststart_present]
           ,[dst_faststart_present]
           ,[src_tunneling_present]
           ,[dst_tunneling_present]
           ,[proxy_mode]
           ,[lar_fault_reason]
           ,[route_retries]
           ,[scd]
           ,[pdd]
           ,[src_media_bytes_in]
           ,[src_media_bytes_out]
           ,[dst_media_bytes_in]
           ,[dst_media_bytes_out]
           ,[src_media_packets]
           ,[dst_media_packets]
           ,[src_media_packets_late]
           ,[dst_media_packets_late]
           ,[src_media_packets_lost]
           ,[dst_media_packets_lost]
           ,[src_min_jitter_size]
           ,[src_max_jitter_size]
           ,[dst_min_jitter_size]
           ,[dst_max_jitter_size]
           ,[last_cdr]
           ,[q850_reason]
           ,[in_cpc]
           ,[out_cpc]
           ,[pass_from]
           ,[in_zone]
           ,[out_zone]
           ,[disconnect_initiator]
           ,[diversion]
           ,[in_ani_type_of_number]
           ,[in_dnis_type_of_number]
           ,[out_ani_type_of_number]
           ,[out_dnis_type_of_number]
           ,[src_in_leg_conf_id]
           ,[src_in_leg_call_id]
           ,[src_out_leg_call_id]
           ,[in_orig_dnis]
           ,[out_orig_dnis]
           ,[src_disconnect_codes]
           ,[dst_disconnect_codes]
           ,[record_type]
    )
select   [cdr_id]
           ,[cdr_date]
           ,[in_ani]
           ,[in_dnis]
           ,[out_ani]
           ,[out_dnis]
           ,[bill_ani]
           ,[bill_dnis]
           ,[sig_node_name]
           ,[src_gatekeeper_address]
           ,[remote_src_sig_address]
           ,[remote_dst_sig_address]
           ,[remote_src_media_address]
           ,[remote_dst_media_address]
           ,[local_src_sig_address]
           ,[local_dst_sig_address]
           ,[local_src_media_address]
           ,[local_dst_media_address]
           ,[in_leg_proto]
           ,[out_leg_proto]
           ,[conf_id]
           ,[in_leg_call_id]
           ,[out_leg_call_id]
           ,[src_user]
           ,[dst_user]
           ,[radius_user]
           ,[src_name]
           ,[dst_name]
           ,[dp_name]
           ,CONVERT(varchar,elapsed_time,20)
           ,CONVERT(varchar,setup_time,20)
           ,CONVERT(varchar,connect_time,20)
           ,CONVERT(varchar,disconnect_time,20)
           ,[disconnect_code]
           ,[in_leg_codecs]
           ,[out_leg_codecs]
           ,[src_faststart_present]
           ,[dst_faststart_present]
           ,[src_tunneling_present]
           ,[dst_tunneling_present]
           ,[proxy_mode]
           ,[lar_fault_reason]
           ,[route_retries]
           ,[scd]
           ,[pdd]
           ,[src_media_bytes_in]
           ,[src_media_bytes_out]
           ,[dst_media_bytes_in]
           ,[dst_media_bytes_out]
           ,[src_media_packets]
           ,[dst_media_packets]
           ,[src_media_packets_late]
           ,[dst_media_packets_late]
           ,[src_media_packets_lost]
           ,[dst_media_packets_lost]
           ,[src_min_jitter_size]
           ,[src_max_jitter_size]
           ,[dst_min_jitter_size]
           ,[dst_max_jitter_size]
           ,[last_cdr]
           ,[q850_reason]
           ,[in_cpc]
           ,[out_cpc]
           ,[pass_from]
           ,[in_zone]
           ,[out_zone]
           ,[disconnect_initiator]
           ,[diversion]
           ,[in_ani_type_of_number]
           ,[in_dnis_type_of_number]
           ,[out_ani_type_of_number]
           ,[out_dnis_type_of_number]
           ,[src_in_leg_conf_id]
           ,[src_in_leg_call_id]
           ,[src_out_leg_call_id]
           ,[in_orig_dnis]
           ,[out_orig_dnis]
           ,[src_disconnect_codes]
           ,[dst_disconnect_codes]
           ,[record_type]
   from openquery(mvtspro,'select * from mvtspro.mvts_cdr where last_cdr=1 and 
   cdr_date >= ''2011-12-20'' 
   and ifnull(connect_time,0) <> 0 and ifnull(disconnect_time,0) <> 0 and connect_time <> disconnect_time
  ') 
where cdr_id in
(select cdr_id from wiztel..mycdrmarks  where  calldate is null);

--and  cdr_date <= ''2011-12-23
exec wMySqlCdrManagerReplicateUpdate @recover=1;

return
end

if @transaction=10 
begin

select @mindt_a=min(cdrcalldate), @maxdt_a=max(cdrcalldate),@c_a=count(*) from tblvoipcdrs_archive;
select @mindt=min(cdrcalldate) , @maxdt=max(cdrcalldate) , @c=count(*) from tblvoipcdrs;
select @mindt_a2=min(cdrcalldate), @maxdt_a2=max(cdrcalldate),@c_a2=count(*) from tblvoipcdrs_archive_part2;

select @mindt_a mindt_a, @maxdt_a maxdt_a, @mindt_a2 mindt_a2, @maxdt_a2 maxdt_a2, @mindt mindt, @maxdt maxdt, 
 datediff(day,@mindt,getdate()) dif , @c_a C_A, @c_a2 C_A2, @c C ;
 
if @view = 1
begin
select top 10 cdr.* from tblVoIPCDRs_archive arch 
join  tblVoIPCDRs cdr on cdr.merarecordid=arch.meraRecordID
where arch.cdrcalldate >='2011-12-28' and cdr.cdrcalldate >='2011-12-28'

;
--11466
select SUM(cdrBillSec)/60.0 ,count(*) mc from tblVoIPCDRs where meraRecordID in
 (select meraRecordID from tblVoIPCDRs_archive);
end;

return; 
end

if @transaction=101 
begin

select @mindt_a=min(cdrcalldate), @maxdt_a=max(cdrcalldate) , @c_a=count(*) from tblvoipcdrs_usa_archive;

select @mindt=min(cdrcalldate) , @maxdt=max(cdrcalldate), @c=count(*) from tblvoipcdrs_usa;
--select @mindt_a2=min(cdrcalldate), @maxdt_a2=max(cdrcalldate) from tblvoipcdrs_usa_archive_part2;

select @mindt_a2=0, @maxdt_a2=0, @c_a2= 0;

select @mindt_a mindt_a, @maxdt_a maxdt_a, @mindt_a2 mindt_a2, @maxdt_a2 maxdt_a2, @mindt mindt, @maxdt maxdt, 
 datediff(day,@mindt,getdate()) dif , @c_a C_A, @c_a2 C_A2, @c C;
 
if @view = 1
begin
select top 10 cdr.* from tblVoIPCDRs_usa_archive arch 
join  tblVoIPCDRs_usa cdr on cdr.merarecordid=arch.meraRecordID
where arch.cdrcalldate >='2011-12-28' and cdr.cdrcalldate >='2011-12-28'
;
--11466
select SUM(cdrBillSec)/60.0 ,count(*) mc from tblVoIPCDRs_usa where meraRecordID in
 (select meraRecordID from tblVoIPCDRs_usa_archive);
end

return 
end

if @transaction=11 
begin

select pid.Name, pl.name as name1 ,pl.partitionid from [wiztel].[dbo].[tblPartitionIdentities] pid
join [wbs].[dbo].[0_1partitionlist] pl on pl.partitionid=pid.refpartition
 where pid.ctype in (1,2)  order by pid.name
 

return 
end

if @transaction=12 
begin
/*
select  gw.equipment_type,gw.gateway_name,gw.src_group_list,dp.group_allow, dp.dialpeer_id,dialpeer_name from 
(
select * from openquery(mvtspro,'select * from mvts_dialpeer 
where enable=1 ') 
) dp
join
(
select * from openquery(mvtspro,'select * from mvts_gateway gw 
where enable=1' )
) gw on 
cast(group_allow as varchar) 
like '%'+cast(src_group_list as varchar)+'%'
where
cast(group_allow as varchar) 
like '%sergey%' 

*/


select  gw.equipment_type,gw.gateway_name,gw.src_group_list,dp.group_allow, dp.dialpeer_id,dialpeer_name,dp.dnis_pattern from 
(
select * from openquery(mvtspro,'select * from mvts_dialpeer 
where enable=1 ') 
) dp
join
(
select * from openquery(mvtspro,'select * from mvts_gateway gw 
where enable=1' )
) gw  on 1=1 
where isnull(dp.gateway_list,'') <> '' and gw.equipment_type=4
and ','+dp.gateway_list+',' like '%,'+cast(gw.gateway_id as varchar)+',%' 


return 
end

if @transaction=92  
begin

declare @dt datetime;
declare @dt2 datetime;


set @dt=dateadd(month,-12,getdate());

set @dt2=(select max(SuccessCallDate) from  [wbs].[dbo].[tblVoipCdrDstNum]);

INSERT INTO [wbs].[dbo].[tblVoipCdrDstNum]
           ([CdrDstNum]
           ,[Answered]
           ,[Failed]
           ,[vdsid]
           ,[SuccessCallDate]
           ,[Good])
     select * from [wiztel].[dbo].[tblVoipCdrDstNum] where SuccessCallDate < @dt
     and SuccessCallDate >= isnull(@dt2,SuccessCallDate)
     
     delete [wiztel].[dbo].[tblVoipCdrDstNum] where SuccessCallDate < @dt;
     
return 
end


end
