/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminSlackSecurityContainer from '../../../services/AdminSlackSecurityContainer';

class SlackSecurityManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRetrieving: true,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async componentDidMount() {
    const { adminSlackSecurityContainer } = this.props;

    try {
      await adminSlackSecurityContainer.retrieveSecurityData();
    }
    catch (err) {
      toastError(err);
    }
    this.setState({ isRetrieving: false });
  }

  async onClickSubmit() {
    const { t, adminSlackSecurityContainer, adminGeneralSecurityContainer } = this.props;

    try {
      await adminSlackSecurityContainer.updateSlackSetting();
      await adminGeneralSecurityContainer.retrieveSetupStratedies();
      toastSuccess(t('security_setting.OAuth.Slack.updated_slack'));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminGeneralSecurityContainer, adminSlackSecurityContainer } = this.props;
    const { isSlackEnabled } = adminGeneralSecurityContainer.state;

    if (this.state.isRetrieving) {
      return null;
    }
    return (

      <React.Fragment>

        <h2 className="alert-anchor border-bottom">
          {t('security_setting.OAuth.Slack.name')}
        </h2>

        {this.state.retrieveError != null && (
          <div className="alert alert-danger">
            <p>{t('Error occurred')} : {this.state.err}</p>
          </div>
        )}

        <div className="row mb-5">
          <div className="col-xs-3 my-3 text-right">
            <strong>{t('security_setting.OAuth.Slack.name')}</strong>
          </div>
          <div className="col-xs-6 text-left">
            <div className="checkbox checkbox-success">
              <input
                id="isSlackEnabled"
                type="checkbox"
                checked={adminGeneralSecurityContainer.state.isSlackEnabled || false}
                onChange={() => { adminGeneralSecurityContainer.switchIsSlackOAuthEnabled() }}
              />
              <label htmlFor="isSlackEnabled">
                {t('security_setting.OAuth.Slack.enable_slack')}
              </label>
            </div>
            {(!adminGeneralSecurityContainer.state.setupStrategies.includes('slack') && isSlackEnabled)
              && <div className="label label-warning">{t('security_setting.setup_is_not_yet_complete')}</div>}
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 text-right">{t('security_setting.callback_URL')}</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              value={adminSlackSecurityContainer.state.callbackUrl}
              readOnly
            />
            <p className="help-block small">{t('security_setting.desc_of_callback_URL', { AuthName: 'OAuth' })}</p>
            {!adminGeneralSecurityContainer.state.appSiteUrl && (
              <div className="alert alert-danger">
                <i
                  className="icon-exclamation"
                  // eslint-disable-next-line max-len
                  dangerouslySetInnerHTML={{ __html: t('security_setting.alert_siteUrl_is_not_set', { link: `<a href="/admin/app">${t('App settings')}<i class="icon-login"></i></a>` }) }}
                />
              </div>
            )}
          </div>
        </div>


        {isSlackEnabled && (
          <React.Fragment>

            <h3 className="border-bottom">{t('security_setting.configuration')}</h3>

            <div className="row mb-5">
              <label htmlFor="slackClientId" className="col-xs-3 text-right">{t('security_setting.clientID')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="slackClientId"
                  defaultValue={adminSlackSecurityContainer.state.slackClientId || ''}
                  onChange={e => adminSlackSecurityContainer.changeSlackClientId(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_SLACK_CLIENT_ID' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <label htmlFor="slackClientSecret" className="col-xs-3 text-right">{t('security_setting.client_secret')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  type="text"
                  name="slackClientSecret"
                  defaultValue={adminSlackSecurityContainer.state.slackClientSecret || ''}
                  onChange={e => adminSlackSecurityContainer.changeSlackClientSecret(e.target.value)}
                />
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Use env var if empty', { env: 'OAUTH_SLACK_CLIENT_SECRET' }) }} />
                </p>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-xs-offset-3 col-xs-6 text-left">
                <div className="checkbox checkbox-success">
                  <input
                    id="bindByUserNameSlack"
                    type="checkbox"
                    checked={adminSlackSecurityContainer.state.isSameUsernameTreatedAsIdenticalUser || false}
                    onChange={() => { adminSlackSecurityContainer.switchIsSameUsernameTreatedAsIdenticalUser() }}
                  />
                  <label
                    htmlFor="bindByUserNameSlack"
                    dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical') }}
                  />
                </div>
                <p className="help-block">
                  <small dangerouslySetInnerHTML={{ __html: t('security_setting.Treat email matching as identical_warn') }} />
                </p>
              </div>
            </div>

            <div className="row my-3">
              <div className="col-xs-offset-3 col-xs-5">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={adminSlackSecurityContainer.state.retrieveError != null}
                  onClick={this.onClickSubmit}
                >
                  {t('Update')}
                </button>
              </div>
            </div>

          </React.Fragment>
        )}

        <hr />

        <div style={{ minHeight: '300px' }}>
          <h4>
            <i className="icon-question" aria-hidden="true"></i>
            <a href="#collapseHelpForSlackOauth" data-toggle="collapse"> {t('security_setting.OAuth.how_to.slack')}</a>
          </h4>
          <ol id="collapseHelpForSlackOauth" className="collapse">
            {/* eslint-disable-next-line max-len */}
            {/* <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Slack.register_1', { link: '<a href="https://api.slack.com/apps" target=_blank>Slack API</a>' }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Slack.register_2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Slack.register_3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Slack.register_4', { url: adminSlackSecurityContainer.state.callbackUrl }) }} />
            <li dangerouslySetInnerHTML={{ __html: t('security_setting.OAuth.Slack.register_5') }} /> */}
          </ol>
        </div>

      </React.Fragment>


    );
  }

}


SlackSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminSlackSecurityContainer: PropTypes.instanceOf(AdminSlackSecurityContainer).isRequired,
};

const SlackSecurityManagementWrapper = (props) => {
  return createSubscribedElement(SlackSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminSlackSecurityContainer]);
};

export default withTranslation()(SlackSecurityManagementWrapper);
