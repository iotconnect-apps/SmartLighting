/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName					nvarchar(255)	
	,@syncDate	DATETIME
EXEC [dbo].[Chart_StatisticsByEntity]	
	@guid = 'B811B983-9448-4021-9978-6C699404EB81'
	,@frequency = 'M'
	,@attribute	= 'Humidity'
	,@invokinguser  = 'E05A4DA0-A8C5-4A4D-886D-F61EC802B5FD'              
	,@version		= 'v1'              
	,@output		= @output		OUTPUT
	,@fieldname		= @fieldName	OUTPUT	
	,@syncDate		= @syncDate		OUTPUT
SELECT @output status, @fieldName fieldName, @syncDate syncDate

001	SAQM-1 30-03-2020 [Nishit Khakhi]	Added Initial Version to represent statistics by Entity

*******************************************************************/
CREATE PROCEDURE [dbo].[Chart_StatisticsByEntity]
(	@guid				UNIQUEIDENTIFIER	
	,@frequency			CHAR(1)		
	,@attribute			NVARCHAR(100)				
	,@invokinguser		UNIQUEIDENTIFIER	= NULL
	,@version			nvarchar(10)              
	,@output			SMALLINT			OUTPUT
	,@fieldname			nvarchar(255)		OUTPUT
	,@syncDate			DATETIME			OUTPUT
	,@culture			nvarchar(10)		= 'en-Us'	
	,@enabledebuginfo	CHAR(1)				= '0'
)
AS
BEGIN
    SET NOCOUNT ON

    IF (@enabledebuginfo = 1)
	BEGIN
        DECLARE @Param XML 
        SELECT @Param = 
        (
            SELECT 'Chart_PeakHoursByElevator' AS '@procName' 
            , CONVERT(nvarchar(MAX),@guid) AS '@guid' 
			, @frequency AS '@frequency' 
			, @attribute AS '@attribute'
            , CONVERT(nvarchar(MAX),@version) AS '@version' 
            , CONVERT(nvarchar(MAX),@invokinguser) AS '@invokinguser' 
            FOR XML PATH('Params')
	    ) 
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END                    
    
    BEGIN TRY  
		DECLARE @dt DATETIME = GETUTCDATE(), @endDate DATETIME
		IF OBJECT_ID('tempdb..#weekdays') IS NOT NULL BEGIN DROP TABLE #weekdays END
		IF OBJECT_ID('tempdb..#OperationHours') IS NOT NULL BEGIN DROP TABLE #OperationHours END
		IF OBJECT_ID('tempdb..#finalTable') IS NOT NULL BEGIN DROP TABLE #finalTable END

		CREATE TABLE #weekdays ([weekDay] NVARCHAR(20))
		CREATE TABLE #OperationHours ([name] NVARCHAR(20), [attribute] NVARCHAR(1000), [entityGuid] UNIQUEIDENTIFIER, [value] DECIMAL(18,2)) 
		CREATE TABLE #finalTable ([name] NVARCHAR(20), [attribute] NVARCHAR(1000), [entityGuid] UNIQUEIDENTIFIER, [value] DECIMAL(18,2)) 
		
		IF @frequency = 'D'
		BEGIN
			SET @endDate = @dt
			INSERT INTO #weekdays values ('00:00'),('02:00'),('04:00'),('06:00'),('08:00'),('10:00'),('12:00'),('14:00'),('16:00'),('18:00'),('20:00'),('22:00')

			;WITH CTE_attribute
			AS 
			(	SELECT DATEPART(HOUR,[date])/2 AS [Hour],[attribute],[entityGuid],AVG([avg]) AS [value] 
				FROM [dbo].[TelemetrySummary_Hourwise] T (NOLOCK)
				INNER JOIN dbo.[Device] D (NOLOCK) ON T.[deviceGuid] = D.[guid] AND [isDeleted] = 0
				WHERE [entityGuid] = @guid AND [attribute] = @attribute AND CONVERT(Date,[date]) BETWEEN CONVERT(DATE,@endDate) AND CONVERT(DATE,@dt)
				GROUP BY DATEPART(HOUR,[date])/2,[attribute],[entityGuid]
			)
			
			INSERT INTO #OperationHours

			SELECT CONVERT(NVARCHAR(2),([Hour]*2)) + ':00' AS [Time],[attribute],[entityGuid],[value]
			FROM dbo.[Entity] E (NOLOCK)
			LEFT JOIN CTE_attribute H ON E.[guid] = H.[entityGuid]
			WHERE E.[guid] = @guid AND [isDeleted] = 0
			
		END
		ELSE IF @frequency = 'W'
		BEGIN
			SET @endDate = DATEADD(DAY,-7,@dt)
			INSERT INTO #weekdays values ('Monday'),('Tuesday'),('Wednesday'),('Thursday'),('Friday'),('Saturday'),('Sunday')
									
			;WITH CTE_attribute
			AS 
			(	SELECT DATENAME(DW,[date]) AS [Day],[attribute],[entityGuid],AVG([avg]) AS [value] 
				FROM [dbo].[TelemetrySummary_Hourwise] T (NOLOCK)
				INNER JOIN dbo.[Device] D (NOLOCK) ON T.[deviceGuid] = D.[guid] AND [isDeleted] = 0
				WHERE [entityGuid] = @guid AND [attribute] = @attribute AND CONVERT(Date,[date]) BETWEEN CONVERT(DATE,@endDate) AND CONVERT(DATE,@dt)
				GROUP BY DATENAME(DW,[date]),[attribute],[entityGuid]
			)
			
			INSERT INTO #OperationHours

			SELECT [Day],[attribute],[entityGuid],[value]
			FROM dbo.[Entity] E (NOLOCK)
			LEFT JOIN CTE_attribute H ON E.[guid] = H.[entityGuid]
			WHERE E.[guid] = @guid AND [isDeleted] = 0
			
		END
		ELSE
		BEGIN
			SET @endDate = DATEADD(YEAR,-1,@dt)
			INSERT INTO #weekdays values ('January'),('February'),('March'),('April'),('May'),('June')
									,('July'),('August'),('September'),('October'),('November'),('December')
			
			;WITH CTE_attribute
			AS 
			(	SELECT DATENAME(MONTH,[Date]) AS [Month],[attribute],[entityGuid],AVG([avg]) AS [value] 
				FROM [dbo].[TelemetrySummary_Hourwise] T (NOLOCK)
				INNER JOIN dbo.[Device] D (NOLOCK) ON T.[deviceGuid] = D.[guid] AND [isDeleted] = 0
				WHERE [entityGuid] = @guid AND [attribute] = @attribute AND CONVERT(Date,[date]) BETWEEN CONVERT(DATE,@endDate) AND CONVERT(DATE,@dt)
				GROUP BY DATENAME(MONTH,[Date]),[attribute],[entityGuid]
			)
			INSERT INTO #OperationHours

			SELECT [Month],[attribute],[entityGuid],[value]
			FROM dbo.[Entity] E (NOLOCK)
			LEFT JOIN CTE_attribute H ON E.[guid] = H.[entityGuid]
			WHERE E.[guid] = @guid AND [isDeleted] = 0
			
		END

		INSERT INTO #finalTable([name],[entityGuid],[attribute])
		SELECT [weekDay],@guid,@attribute
		FROM #weekDays
		
		UPDATE #finalTable
		SET [value] = o.[value]
		FROM #finalTable f
		INNER JOIN #OperationHours o ON f.[entityGuid] = o.[entityGuid] AND f.[name] = o.[name]

		SELECT * FROM  (
		SELECT O.[name] , [attribute] , E.[name] AS [entityName] , ISNULL([value] ,0) AS [value] 
		FROM #finalTable O 
		LEFT join [Entity] E (nolock) ON O.[entityGuid] = E.[guid] AND [isDeleted] = 0
		) A
		ORDER BY 
			CASE WHEN @frequency = 'D' THEN
				CASE [name] 
					WHEN '00:00' THEN 1
					WHEN '03:00' THEN 2
					WHEN '06:00' THEN 3
					WHEN '09:00' THEN 4
					WHEN '12:00' THEN 5
					WHEN '15:00' THEN 6
					WHEN '18:00' THEN 7
					WHEN '21:00' THEN 8
					ELSE 9
				END 
			ELSE CASE WHEN @frequency = 'W' THEN
				CASE [name] 
					WHEN 'Monday' THEN 1
					WHEN 'Tuesday' THEN 2
					WHEN 'Wednesday' THEN 3
					WHEN 'Thursday' THEN 4
					WHEN 'Friday' THEN 5
					WHEN 'Saturday' THEN 6
					ELSE 7
				END 
			ELSE CASE WHEN @frequency = 'M' THEN
					CASE [name] 
						WHEN 'January' THEN 1
						WHEN 'February' THEN 2
						WHEN 'March' THEN 3
						WHEN 'April' THEN 4
						WHEN 'May' THEN 5
						WHEN 'June' THEN 6
						WHEN 'July' THEN 7
						WHEN 'August' THEN 8
						WHEN 'September' THEN 9
						WHEN 'October' THEN 10
						WHEN 'November' THEN 11
						ELSE 12
					END 
				END
			END
			END
			ASC

	    SET @output = 1
		SET @fieldname = 'Success'   
        SET @syncDate = (SELECT TOP 1 CONVERT(DATETIME,[value]) FROM dbo.[Configuration] (NOLOCK) WHERE [configKey] = 'telemetry-last-exectime') 
	END TRY	
	BEGIN CATCH	
		DECLARE @errorReturnMessage nvarchar(MAX)

		SET @output = 0

		SELECT @errorReturnMessage = 
			ISNULL(@errorReturnMessage, '') +  SPACE(1)   + 
			'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as nvarchar), '')  + 
			'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as nvarchar), '') + 
			'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as nvarchar), '') + 
			'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as nvarchar), '') + 
			'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as nvarchar), '') + 
			'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as nvarchar(max)), '')
		RAISERROR (@errorReturnMessage, 11, 1)  
 
		IF (XACT_STATE()) = -1  
		BEGIN   
			ROLLBACK TRANSACTION 
		END   
		IF (XACT_STATE()) = 1  
		BEGIN      
			ROLLBACK TRANSACTION  
		END   
		RAISERROR (@errorReturnMessage, 11, 1)   
	END CATCH
END