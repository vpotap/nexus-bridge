import N19popupApplet from './n19popupApplet';

const singleton = Symbol('singleton');
const singletonEnforcer = Symbol('singletonEnforcer');

export default class N19popupController {
  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new N19popupController(singletonEnforcer);
    }
    return this[singleton];
  }

  constructor(enforcer) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Instantiation failed: get popup controller instance instead of new.');
    }

    this.consts = SiebelJS.Dependency('SiebelApp.Constants');
    this.isPopupHidden = false;
    this.resolvePromise = null;
    this.popupAppletN19 = null; // it could be removed in the next version
    this.assocAppletN19 = null; // it could be removed in the next version

    console.log('popup controller started...'); // eslint-disable-line no-console

    this.N19resizeAvailable = SiebelApp.MvgBeautifier.resizeAvailable;
    SiebelApp.MvgBeautifier.resizeAvailable = () => { // TODO: NB+ DO WE NEED IT
      try {
        this.N19resizeAvailable.call(SiebelApp.MvgBeautifier);
      } catch (e) {
        console.log(`resizeAvailable Error: ${e.name} ${e.message}`); // eslint-disable-line no-console
      }
    };

    // it will be a singleton, so there is no cleanup
    this.N19processNewPopup = SiebelApp.S_App.ProcessNewPopup;
    SiebelApp.S_App.ProcessNewPopup = (ps) => {
      let ret;
      if (this.isPopupHidden) {
        ret = this.processNewPopup(ps);
        this.isPopupHidden = false; // in order to do not affect the next call
      } else {
        ret = this.N19processNewPopup.call(SiebelApp.S_App, ps);
      }
      return ret;
    };

    SiebelApp.S_App.GetPopupPM().AddMethod('OnLoadPopupContent', () => {
      if (typeof this.resolvePromise === 'function') {
        const { applet, assocApplet } = N19popupController.IsPopupOpen();
        if (!applet) {
          this.resolvePromise = null; // how do we do error handling
          throw new Error('Open Popup Applet is not found in OnLoadPopupContent resolving Promise');
        }

        const arr = Object.values(SiebelAppFacade.NB);
        for (let i = 0; i < arr.length; i += 1) {
          if (arr[i].isPopup) { // this is popup
            if (assocApplet && arr[i].isMvgAssoc) {
              this.assocAppletN19 = arr[i];
            } else {
              this.popupAppletN19 = arr[i];
            }
          }
        }

        const obj = {
          appletName: this.popupAppletN19.appletName,
          popupAppletN19: this.popupAppletN19,
        };

        if (assocApplet) { // shuttle
          obj.assocAppletN19 = this.assocAppletN19;

          obj.availableRecordSet = this.assocAppletN19.getControlsRecordSet();
          obj.selectedRecordSet = this.popupAppletN19.getControlsRecordSet();
        } else { // assoc only OR pick
          obj.availableRecordSet = this.popupAppletN19.getControlsRecordSet();
        }

        this.resolvePromise(obj);
        this.resolvePromise = null;
      }
    }, { sequence: false });
  }

  _createNexusInstance(pm) {
    return new N19popupApplet(Object.assign({}, this.settings, { pm }));
  }

  canOpenPopup() {
    return typeof this.resolvePromise !== 'function';
  }

  processNewPopup(ps) {
    const popupPM = SiebelApp.S_App.GetPopupPM();

    if (!popupPM.GetRenderer()) {
      popupPM.Setup(); // to create PR
    }

    // this property is added using AttachPMBinding into the Init PR (called by PM Setup)
    // it is the reason why we have reinit procedure where Setup PM is called
    popupPM.AddProperty('state', this.consts.get('POPUP_STATE_VISIBLE'));

    let url = ps.GetProperty('URL');
    url = SiebelApp.S_App.GetPageURL() + url.split('start.swe')[1];
    popupPM.SetProperty('url', url);

    return 'refreshpopup';
  }

  closePopupApplet() {
    if (!this.popupAppletN19 || !this.popupAppletN19.pm) {
      throw new Error('The popup applet was not opened by NB!');
    }
    if (!this.popupAppletN19.pm.ExecuteMethod('CanInvokeMethod', 'CloseApplet')) {
      throw new Error('The method CloseApplet is not allowed!');
    }
    const ret = this.popupAppletN19.pm.ExecuteMethod('InvokeMethod', 'CloseApplet');
    // it could be better if we don't have a Siebel Applet on the view
    // do reinit here on closing?
    this.popupAppletN19 = null;
    this.assocAppletN19 = null;
    return ret;
  }

  static IsPopupOpen() { // safer to keep this method, even when we set some properties on resolve?
    const currPopups = SiebelApp.S_App.GetPopupPM().Get('currPopups');
    if (0 === currPopups.length) {
      return { isOpen: false };
    }
    if (1 === currPopups.length) {
      return { isOpen: true, applet: currPopups[0] };
    }
    if (2 === currPopups.length) {
      // is this always a shuttle when we have more one applet
      // OpenUI assumes that 0 is mvg, so do I
      return { isOpen: true, applet: currPopups[0], assocApplet: currPopups[1] };
    }
    throw new Error('should never have been here...');
  }

  checkOpenedPopup(closeIfOpen) {
    const { isOpen } = N19popupController.IsPopupOpen();
    if (isOpen && closeIfOpen) {
      // this code will close the applet even if this applet was originated by another applet
      console.log('closing already opened popup applet in checkOpenedPopup...'); // eslint-disable-line no-console
      // maybe do not close if the applet to be opened if the same as already opened?
      return this.closePopupApplet();
    }
    return isOpen;
  }

  _openAssocApplet(hide, newRecordFunc, cb) {
    this.checkOpenedPopup(true);
    this.isPopupHidden = !!hide;

    newRecordFunc(); // make async of invokeMethod?

    if (hide) {
      let ret = new Promise((resolve) => { this.resolvePromise = resolve; });
      if (typeof cb === 'function') {
        ret = ret.then(cb);
      }
      return ret;
    }

    return true;
  }

  showPopupApplet(hide, cb, n19, methodName) {
    // TODO: maybe use the properties set on promise resolving?
    this.checkOpenedPopup(true);

    this.isPopupHidden = !!hide;

    n19.pm.ExecuteMethod('InvokeMethod', methodName);
    // can call EditField if EditPopup?

    if (hide) { // we will populate the instances only when applet should be hidden
      let ret = new Promise((resolve) => { this.resolvePromise = resolve; });
      if (typeof cb === 'function') {
        ret = ret.then(cb);
      }
      return ret;
    }

    return true;
  }
}
