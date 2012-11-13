SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `apnrs` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci ;
SHOW WARNINGS;
USE `apnrs` ;

-- -----------------------------------------------------
-- Table `apnrs`.`Devices`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `apnrs`.`Devices` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `active` TINYINT(1) NOT NULL DEFAULT 1 ,
  `token` VARCHAR(64) NOT NULL ,
  `silentStartGMT` TIME NOT NULL ,
  `silentEndGMT` TIME NOT NULL ,
  `deviceBadge` TINYINT NOT NULL ,
  `lastRegisterDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`Tags`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `apnrs`.`Tags` (
  `id` INT UNSIGNED NOT NULL ,
  `tag` VARCHAR(45) NOT NULL ,
  `createDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`DevicesTags`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `apnrs`.`DevicesTags` (
  `id` INT UNSIGNED NOT NULL ,
  `deviceID` INT NOT NULL ,
  `tagID` INT NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
