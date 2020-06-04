import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth0 } from "../../react-auth0-spa";
import { USER, POWER_OFF } from "../../constants/faicons"
import { PROFILE_ROUTE } from "../../constants/routes"
import { PROFILE_PAGE_LABEL, LOGOUT_LABEL, DROPDOWN_PROFILE_CSS, NAV_CSS} from "./constants.navbar"

export const LoggedIn = (props) => {
    const { user, logout } = useAuth0();

    const logoutWithRedirect = () =>
    logout({
        returnTo: window.location.origin + window.location.pathname
    });

    return (
        <UncontrolledDropdown nav inNavbar>
            <DropdownToggle  nav caret id="profileDropDown" className={NAV_CSS.profileButton} >
                <img src={user.picture}
                    alt={PROFILE_PAGE_LABEL}
                    className={NAV_CSS.profileImage} 
                    width="50"/>
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem header>{user.name}</DropdownItem>
                <DropdownItem tag = {RouterNavLink}
                    to= {PROFILE_ROUTE}
                    className={DROPDOWN_PROFILE_CSS}
                    activeClassName="router-link-exact-active">
                    <FontAwesomeIcon icon={USER} className="mr-3" /> {PROFILE_PAGE_LABEL}
                </DropdownItem>
                <DropdownItem id="qsLogoutBtn" onClick={() => logoutWithRedirect()}>
                    <FontAwesomeIcon icon={POWER_OFF} className="mr-3" /> {LOGOUT_LABEL}
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}
