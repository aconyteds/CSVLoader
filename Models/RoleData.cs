using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace CSVLoader.Models
{
    public class RoleData
    {
        [DisplayName("ATTUID")]
        public string ATTUID { get; set; }

        [DisplayName("Last Login Date")]
        public DateTime LAST_LOGIN_DATE { get; }

        [DisplayName("Active")]
        public string Active { get; set; }

        [DisplayName("Role Code")]
        public string ROLE_CD { get; set; }

        [DisplayName("RequestorGroup")]
        public string RequestorGroup { get; set; }
    }
}