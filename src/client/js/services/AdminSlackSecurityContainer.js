import { Container } from 'unstated';
import loggerFactory from '@alias/logger';

import { pathUtils } from 'growi-commons';
import urljoin from 'url-join';
import removeNullPropertyFromObject from '../../../lib/util/removeNullPropertyFromObject';

const logger = loggerFactory('growi:security:AdminSlackSecurityContainer');

/**
 * Service container for admin security page (SlackSecurityManagement.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminSlackSecurityContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      retrieveError: null,
      callbackUrl: urljoin(pathUtils.removeTrailingSlash(appContainer.config.crowi.url), '/passport/slack/callback'),
      slackClientId: '',
      slackClientSecret: '',
      isSameUsernameTreatedAsIdenticalUser: false,
    };


  }

  /**
   * retrieve security data
   */
  async retrieveSecurityData() {
    try {
      const response = await this.appContainer.apiv3.get('/security-setting/');
      const { slackOAuth } = response.data.securityParams;
      this.setState({
        slackClientId: slackOAuth.slackClientId,
        slackClientSecret: slackOAuth.slackClientSecret,
        isSameUsernameTreatedAsIdenticalUser: slackOAuth.isSameUsernameTreatedAsIdenticalUser,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSlackSecurityContainer';
  }

  /**
   * Change slackClientId
   */
  changeSlackClientId(value) {
    this.setState({ slackClientId: value });
  }

  /**
   * Change slackClientSecret
   */
  changeSlackClientSecret(value) {
    this.setState({ slackClientSecret: value });
  }

  /**
   * Switch isSameUsernameTreatedAsIdenticalUser
   */
  switchIsSameUsernameTreatedAsIdenticalUser() {
    this.setState({ isSameUsernameTreatedAsIdenticalUser: !this.state.isSameUsernameTreatedAsIdenticalUser });
  }

  /**
   * Update slackSetting
   */
  async updateSlackSetting() {
    const { slackClientId, slackClientSecret, isSameUsernameTreatedAsIdenticalUser } = this.state;

    let requestParams = {
      slackClientId, slackClientSecret, isSameUsernameTreatedAsIdenticalUser,
    };

    requestParams = await removeNullPropertyFromObject(requestParams);
    const response = await this.appContainer.apiv3.put('/security-setting/slack-oauth', requestParams);
    const { securitySettingParams } = response.data;

    this.setState({
      slackClientId: securitySettingParams.slackClientId,
      slackClientSecret: securitySettingParams.slackClientSecret,
      isSameUsernameTreatedAsIdenticalUser: securitySettingParams.isSameUsernameTreatedAsIdenticalUser,
    });
    return response;
  }

}
