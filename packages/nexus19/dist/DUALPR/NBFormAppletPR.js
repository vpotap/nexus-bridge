if (typeof (SiebelAppFacade.NBFormAppletPR) === "undefined") {

  SiebelJS.Namespace("SiebelAppFacade.NBDefaultFormAppletPR");
  define("siebel/custom/NBFormAppletPR", ["siebel/custom/NBDefaultFormAppletPR"],
    function () {
      SiebelAppFacade.NBFormAppletPR = (function () {

        function NBFormAppletPR(pm) {
          SiebelAppFacade.NBFormAppletPR.superclass.constructor.apply(this, arguments);
        }

        SiebelJS.Extend(NBFormAppletPR, SiebelAppFacade.NBDefaultFormAppletPR);

        NBFormAppletPR.prototype.Init = function () {
          this.isOpenUI = true; // Change according to your requirement

          if (this.isOpenUI) {
            SiebelAppFacade.NBFormAppletPR.superclass.Init.apply(this, arguments);
          } else {
            SiebelAppFacade.NBFormAppletPR.superclass.NBInit.apply(this, arguments);
            this.initializeNexus({ convertDates: true }); // should be before removing to read the required fields
            this.removeHtml();
          }
        }

        NBFormAppletPR.prototype.ShowUI = function () {
          if (this.isOpenUI) {
            SiebelAppFacade.NBFormAppletPR.superclass.ShowUI.apply(this, arguments);
          }
        }

        NBFormAppletPR.prototype.BindData = function (bRefresh) {
          if (this.isOpenUI) {
            SiebelAppFacade.NBFormAppletPR.superclass.BindData.apply(this, arguments);
          }
        }

        NBFormAppletPR.prototype.BindEvents = function () {
          if (this.isOpenUI) {
            SiebelAppFacade.NBFormAppletPR.superclass.BindEvents.apply(this, arguments);
          }
        }

        NBFormAppletPR.prototype.EndLife = function () {
          this.destroyNexus();
          SiebelAppFacade.NBFormAppletPR.superclass.EndLife.apply(this, arguments);
        }

        return NBFormAppletPR;
      }()
      );
      return "SiebelAppFacade.NBFormAppletPR";
    })
}