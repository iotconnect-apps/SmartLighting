using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;
using host.iot.solution.Controllers;
using System.Xml.Serialization;
using System.Xml;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using System.Text;

namespace iot.solution.host.Controllers
{
    [Route(AlertRoute.Route.Global)]
    [ApiController]
    public class AlertController : BaseController
    {
        private readonly IRuleService _ruleService;

        public AlertController(IRuleService ruleService)
        {
            _ruleService = ruleService;
        }


        [HttpPost]
        [AllowAnonymous]
        [Route(AlertRoute.Route.Manage, Name = AlertRoute.Name.Manage)]
        public Entity.BaseResponse<bool> Manage()
        {
            Entity.BaseResponse<bool> response = new Entity.BaseResponse<bool>(true);
            try
            {
                using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
                {
                    string strRequest = reader.ReadToEndAsync().Result;
                    Entity.IOTAlertMessage objRequest = Newtonsoft.Json.JsonConvert.DeserializeObject<Entity.IOTAlertMessage>(strRequest);
                    if (!string.IsNullOrWhiteSpace(strRequest))
                    {
                        XmlSerializer xsSubmit = new XmlSerializer(typeof(Entity.IOTAlertMessage));
                        string xml = "";
                        using (var sww = new StringWriter())
                        {
                            using (XmlWriter writer = XmlWriter.Create(sww))
                            {
                                xsSubmit.Serialize(writer, objRequest);
                                xml = sww.ToString();
                            }
                        }
                        _ruleService.ManageWebHook(xml);
                        response.IsSuccess = true;
                    }
                }
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<bool>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(AlertRoute.Route.List, Name = AlertRoute.Name.List)]
        public Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>> GetBySearch(string deviceGuid = null, string entityGuid = null, int? pageNo = 1, int? pageSize = 10, string orderBy = "")
        {
            Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>> response = new Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>>(true);
            try
            {
                response.Data = _ruleService.AlertList(new Entity.AlertRequest()
                {
                    DeviceGuid = deviceGuid,
                    EntityGuid = entityGuid,
                    OrderBy = orderBy,
                    PageNumber = pageNo,
                    PageSize = pageSize
                });
                //List<Entity.AlertResponse> lstItems = new List<Entity.AlertResponse>();
                //lstItems.Add(new Entity.AlertResponse() { DeviceUniqueId = "Device 1", EntityName = "Entity 1", Guid = Guid.NewGuid(), EventDate = DateTime.Now.ToString(), Message = "Rule one is matched", Severity = "Critical" });
                //lstItems.Add(new Entity.AlertResponse() { DeviceUniqueId = "Device 2", EntityName = "Entity 1", Guid = Guid.NewGuid(), EventDate = DateTime.Now.ToString(), Message = "Rule two is matched", Severity = "Critical" });
                //lstItems.Add(new Entity.AlertResponse() { DeviceUniqueId = "Device 3", EntityName = "Entity 2", Guid = Guid.NewGuid(), EventDate = DateTime.Now.ToString(), Message = "Rule three is matched", Severity = "Critical" });
                //lstItems.Add(new Entity.AlertResponse() { DeviceUniqueId = "Device 4", EntityName = "Entity 2", Guid = Guid.NewGuid(), EventDate = DateTime.Now.ToString(), Message = "Rule four is matched", Severity = "Critical" });
                //lstItems.Add(new Entity.AlertResponse() { DeviceUniqueId = "Device 5", EntityName = "Entity 3", Guid = Guid.NewGuid(), EventDate = DateTime.Now.ToString(), Message = "Rule five is matched", Severity = "Critical" });
                //lstItems.Add(new Entity.AlertResponse() { DeviceUniqueId = "Device 6", EntityName = "Entity 3", Guid = Guid.NewGuid(), EventDate = DateTime.Now.ToString(), Message = "Rule six is matched", Severity = "Critical" });
                //response.Data = new Entity.SearchResult<List<Entity.AlertResponse>>()
                //{
                //    Count = 5,
                //    Items = lstItems
                //};
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.SearchResult<List<Entity.AlertResponse>>>(false, ex.Message);
            }
            return response;
        }
    }

    public class IOTMessage
    {
        public string message { get; set; }
        public string companyGuid { get; set; }
        public string condition { get; set; }
        public string deviceGuid { get; set; }
        public string entityGuid { get; set; }
        public DateTime eventDate { get; set; }
        public string uniqueId { get; set; }
        public string audience { get; set; }
        public int eventId { get; set; }
        public string refGuid { get; set; }
        public string severity { get; set; }
        public string ruleName { get; set; }
        public string data { get; set; }
    }

}