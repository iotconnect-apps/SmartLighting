/*******************************************************************
DECLARE @output INT = 0
	,@fieldName	nvarchar(255)	
	,@newid		UNIQUEIDENTIFIER
EXEC [dbo].[DeviceSetting_AddUpdate]	
	@DeviceGuid	= '98611812-0DB2-4183-B352-C3FEC9A3D1A4'
	,@amTime		= '06:00:00'
	,@pmTime		= '06:00:00'	
	,@intensityOn = 200
	,@intensityOff = 400
	,@presenceTime	= 15000
	,@dimming	= 40
	,@invokingUser	= 'C1596B8C-7065-4D63-BFD0-4B835B93DFF2'              
	,@version		= 'v1'              
	,@newid			= @newid		OUTPUT
	,@output		= @output		OUTPUT
	,@fieldName		= @fieldName	OUTPUT	

SELECT @output status, @fieldName fieldName, @newid newid

001	Sl-4	23-04-2020 [Nishit Khakhi]	Added Initial Version to Add Device Maintenance
*******************************************************************/
CREATE PROCEDURE [dbo].[DeviceSetting_AddUpdate]
(	@DeviceGuid	UNIQUEIDENTIFIER	
	,@amTime		TIME(0)				= NULL				
	,@pmTime		TIME(0)				= NULL
	,@intensityOn	INT	   				= NULL
	,@intensityOff	INT	   				= NULL
	,@presenceTime	BIGINT				= NULL
	,@dimming		INT					= NULL
	,@invokingUser	UNIQUEIDENTIFIER	= NULL
	,@version		nvarchar(10)    
	,@newid			UNIQUEIDENTIFIER	OUTPUT
	,@output		SMALLINT			OUTPUT    
	,@fieldName		nvarchar(100)		OUTPUT   
	,@culture		nvarchar(10)		= 'en-Us'
	,@enableDebugInfo	CHAR(1)			= '0'
)	
AS
BEGIN
	SET NOCOUNT ON

    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML 
        SELECT @Param = 
        (
            SELECT 'DeviceSetting_AddUpdate' AS '@procName'             
            	, CONVERT(nvarchar(MAX),@DeviceGuid) AS '@DeviceGuid' 				
				, CONVERT(nvarchar(100),@amTime) AS '@amTime'
				, CONVERT(nvarchar(100),@pmTime) AS '@pmTime'
				, CONVERT(nvarchar(15),@intensityOn) AS '@intensityOn'
				, CONVERT(nvarchar(15),@intensityOff) AS '@intensityOff'
				, CONVERT(nvarchar(100),@presenceTime) AS '@presenceTime'
				, CONVERT(NVARCHAR(15),@dimming) AS '@dimming'
				, CONVERT(nvarchar(MAX),@invokingUser) AS '@invokingUser'
            	, CONVERT(nvarchar(MAX),@version) AS '@version' 
            	, CONVERT(nvarchar(MAX),@output) AS '@output' 
            	, @fieldName AS '@fieldName'   
            FOR XML PATH('Params')
	    ) 
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END       
	
	SET @newid = NEWID()

	SET @output = 1
	SET @fieldName = 'Success'

	BEGIN TRY

	BEGIN TRAN	
		IF NOT EXISTS (SELECT TOP 1 1 FROM [DeviceSetting] (NOLOCK) WHERE [deviceGuid] = @DeviceGuid AND [isDeleted] = 0)
		BEGIN
			INSERT INTO [dbo].[DeviceSetting](
				[guid]		
				,[deviceGuid]
				,[amTime]
				,[pmTime]
				,[intensityOn]
				,[intensityOff]
				,[presenceTime]
				,[dimming]
				,[createddate]
				,[isDeleted]
				)
			VALUES(@newid
				,@DeviceGuid
				,@amTime
				,@pmTime
				,@intensityOn
				,@intensityOff
				,@presenceTime
				,@dimming
				,GETUTCDATE()
				,0
				)	
		END
		ELSE
		BEGIN
			UPDATE [DeviceSetting]
			SET [amTime] = ISNULL(@amTime,[amTime])
				,[pmTime] = ISNULL(@pmTime,[pmTime])
				,[intensityOn] = ISNULL(@intensityOn,[intensityOn])
				,[intensityOff] = ISNULL(@intensityOff,[intensityOff])
				,[presenceTime] = ISNULL(@presenceTime,[presenceTime])
				,[dimming] = ISNULL(@dimming,[dimming])
			WHERE [deviceGuid] = @deviceGuid AND [isDeleted] = 0
		END
	COMMIT TRAN	
	END TRY	
	BEGIN CATCH
	SET @output = 0
	DECLARE @errorReturnMessage nvarchar(MAX)

	SELECT
		@errorReturnMessage = ISNULL(@errorReturnMessage, ' ') + SPACE(1) +
		'ErrorNumber:' + ISNULL(CAST(ERROR_NUMBER() AS nvarchar), ' ') +
		'ErrorSeverity:' + ISNULL(CAST(ERROR_SEVERITY() AS nvarchar), ' ') +
		'ErrorState:' + ISNULL(CAST(ERROR_STATE() AS nvarchar), ' ') +
		'ErrorLine:' + ISNULL(CAST(ERROR_LINE() AS nvarchar), ' ') +
		'ErrorProcedure:' + ISNULL(CAST(ERROR_PROCEDURE() AS nvarchar), ' ') +
		'ErrorMessage:' + ISNULL(CAST(ERROR_MESSAGE() AS nvarchar(MAX)), ' ')

	RAISERROR (@errorReturnMessage
	, 11
	, 1
	)

	IF (XACT_STATE()) = -1 BEGIN
		ROLLBACK TRANSACTION
	END
	IF (XACT_STATE()) = 1 BEGIN
		ROLLBACK TRANSACTION
	END
	END CATCH
END