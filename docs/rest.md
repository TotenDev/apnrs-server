##General Methods

####Register device (POST)
- Authentication: Client & Server credentials
- Method: `POST`
- URL: `example.com/register/` OR `example.com/register`	
- Body Values:
	- 'token' - string - device token - **REQUIRED**
	- 'tags' - array(string) - Array of strings(Tags), this tag are created/removed on-demand - **OPTIONAL** - if not specified device will be dissociated from that tag 
	- 'silent' - obj - Obj with relevant informations for silent time - **OPTIONAL** - if not specified it will use default server silent time (9-23).
	- 'silent.startDate' - date - Start date of silent time for this device - **REQUIRED**
	- 'silent.endDate' - date - End date of silent time for this device - **REQUIRED**
	- 'silent.timezone' - string - timezone used on silent time date for this device - **REQUIRED**
	
	**Sample**
```
{
	'token':'myToken',
	'tags':['blue'],
	'startDate':'09:00',
	'endDate':'23:00',
	'timezone':'-0300'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`
	
---
####Send Push Message (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/sendpush/` OR `example.com/sendpush`	
- Body Values:
	- 'tokens' - array(string) - Array of strings(Tokens), this tokens are the devices token (can be used with tags) - **OPTIONAL** (one of 'tokes','tags' or 'broadcast' got be used)
	- 'tags' - array(string) - Array of strings(Tags), this tags are shortcut for tokens (can be used with tokens) - **OPTIONAL** (one of 'tokes','tags' or 'broadcast' got be used)
	- 'broadcast' - boolean - Indicates if is a broadcast message or not (will invalidate tags and tokens if true) - **OPTIONAL** (one of 'tokes','tags' or 'broadcast' got be used)
	- 'msg' - obj - APN message object, if additional values is needed place inside msg object to send - **REQUIRED**
	- 'msg.alert' - string - alert to be displayed on push notifications message - **OPTIONAL**
	- 'msg.sound' - string - sound name to be played when push message arrive on device. - **OPTIONAL** - **IMPORTANT** default will use default sound. For silent message insert a invalid file sound string.
	- 'msg.bagde' - string|integer - Badge to be displayed, BUT you can use +5 do add into existing badge. 0 will remove badge if exists. - **OPTIONAL**
	
	**Sample**
```
{"tokens":["AAAAAAAAa1e9077394ca80f9aAAAAAAAAc52a46fb8bccef3606baaddAAAAAAAA"],"msg":{"alert":"What's up ?","badge":"+1"}}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`	
	

##Statistics


####Stats Devices (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/stats/devices/` OR `example.com/stats/devices`
- Body Values:
	- 'startDate' - date - Start date of (un)register for data points - **REQUIRED**
	- 'endDate' - date - End date of (un)register for data points - **REQUIRED**
	
	**Sample**
```
{
	'startDate':'11/11/2012 09:09:12',
	'endDate':'12/12/2012'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`	

---
####Stats Push Notifications (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/stats/push/` OR `example.com/stats/push`	
- Body Values:
	- 'startDate' - date - Start date of push for data points - **REQUIRED**
	- 'endDate' - date - End date of push for data points - **REQUIRED**
	
	**Sample**
```
{
	'startDate':'11/11/2012 09:09:12',
	'endDate':'12/12/2012'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`	
	

##Listing


####List Devices (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/list/devices/` OR `example.com/list/devices`
- Body Values:
	- 'order' - typed - ASC/DSC - **OPTIONAL** - Default is ASC order by date
	
	**Sample**
```
{
	'order':'ASC'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`	

---
####List Tags (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/list/tags/` OR `example.com/list/tags`
- Body Values:
	- 'order' - typed - ASC/DSC - **OPTIONAL** - Default is ASC order by date
	
	**Sample**
```
{
	'order':'ASC'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`
	
---
####List Push (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/list/push/` OR `example.com/list/push`
- Body Values:
	- 'order' - typed - ASC/DSC - **OPTIONAL** - Default is ASC order by date
	
	**Sample**
```
{
	'order':'ASC'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`
	
---
####List Feedback calls (POST)
- Authentication: Server credentials
- Method: `POST`
- URL: `example.com/list/feedback/` OR `example.com/list/feedback`
- Body Values:
	- 'order' - typed - ASC/DSC - **OPTIONAL** - Default is ASC order by date
	
	**Sample**
```
{
	'order':'ASC'
}
```
- Success codes: 
	- `200`
- Error Codes: 
	- `20X`
	- `4XX`
	- `5XX`