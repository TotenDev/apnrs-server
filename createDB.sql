SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `apnrs` ;
CREATE SCHEMA IF NOT EXISTS `apnrs` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci ;
SHOW WARNINGS;
USE `apnrs` ;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_devices`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_devices` (
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
-- Table `apnrs`.`apnrs_tags`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_tags` (
  `id` INT UNSIGNED NOT NULL ,
  `tag` VARCHAR(45) NOT NULL ,
  `createDate` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `apnrs`.`apnrs_devices_tags`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `apnrs`.`apnrs_devices_tags` (
  `id` INT UNSIGNED NOT NULL ,
  `deviceID` INT NOT NULL ,
  `tagID` INT NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;

SHOW WARNINGS;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;